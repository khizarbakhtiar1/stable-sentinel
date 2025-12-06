#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { StableSentinel } from './core/sentinel';
import { getAllStablecoins, getStablecoin } from './data/stablecoins';
import { formatCurrency, formatPercentage, formatLargeNumber } from './utils/math';
import { HealthReport, ChainId } from './types';

const program = new Command();

program
  .name('stablesentinel')
  .description('Real-time stablecoin health monitoring and risk intelligence')
  .version('0.1.0');

/**
 * Check command - Get health status of a stablecoin
 */
program
  .command('check <symbol>')
  .description('Check health status of a specific stablecoin')
  .option('-c, --chain <chain>', 'Blockchain network', 'ethereum')
  .action(async (symbol: string, options: { chain: ChainId }) => {
    const spinner = ora(`Checking ${symbol.toUpperCase()} health...`).start();

    try {
      const sentinel = new StableSentinel();
      const health = await sentinel.getHealth(symbol.toUpperCase(), options.chain);

      spinner.succeed(`Health check complete for ${symbol.toUpperCase()}`);
      console.log();

      displayHealthReport(health);
    } catch (error) {
      spinner.fail(`Failed to check ${symbol.toUpperCase()}`);
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

/**
 * Monitor command - Monitor multiple stablecoins
 */
program
  .command('monitor [symbols...]')
  .description('Monitor multiple stablecoins')
  .option('-c, --chain <chain>', 'Blockchain network', 'ethereum')
  .action(async (symbols: string[], options: { chain: ChainId }) => {
    if (symbols.length === 0) {
      symbols = ['USDT', 'USDC', 'DAI']; // Default stablecoins
    }

    const spinner = ora('Fetching health data...').start();

    try {
      const sentinel = new StableSentinel();
      const reports = await sentinel.getMultipleHealth(
        symbols.map((s) => s.toUpperCase()),
        options.chain
      );

      spinner.succeed('Health data fetched');
      console.log();

      displayHealthTable(reports);
    } catch (error) {
      spinner.fail('Failed to fetch health data');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

/**
 * Risk command - Get detailed risk report
 */
program
  .command('risk <symbol>')
  .description('Get detailed risk report for a stablecoin')
  .option('-c, --chain <chain>', 'Blockchain network', 'ethereum')
  .action(async (symbol: string, options: { chain: ChainId }) => {
    const spinner = ora(`Analyzing risk for ${symbol.toUpperCase()}...`).start();

    try {
      const sentinel = new StableSentinel();
      const health = await sentinel.getHealth(symbol.toUpperCase(), options.chain);

      spinner.succeed(`Risk analysis complete for ${symbol.toUpperCase()}`);
      console.log();

      displayDetailedRiskReport(health);
    } catch (error) {
      spinner.fail(`Failed to analyze ${symbol.toUpperCase()}`);
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

/**
 * List command - List all supported stablecoins
 */
program
  .command('list')
  .description('List all supported stablecoins')
  .action(() => {
    console.log(chalk.bold('\n📊 Supported Stablecoins:\n'));

    const stablecoins = getAllStablecoins();
    const table = new Table({
      head: [
        chalk.cyan('Symbol'),
        chalk.cyan('Name'),
        chalk.cyan('Type'),
        chalk.cyan('Chains'),
      ],
      colWidths: [10, 25, 25, 40],
    });

    for (const symbol of stablecoins) {
      const metadata = getStablecoin(symbol)!;
      const chains = Object.keys(metadata.addresses).join(', ');
      
      table.push([
        chalk.bold(symbol),
        metadata.name,
        metadata.type,
        chains,
      ]);
    }

    console.log(table.toString());
    console.log();
  });

/**
 * Watch command - Real-time monitoring
 */
program
  .command('watch <symbol>')
  .description('Watch a stablecoin in real-time (updates every 60 seconds)')
  .option('-c, --chain <chain>', 'Blockchain network', 'ethereum')
  .option('-i, --interval <seconds>', 'Update interval in seconds', '60')
  .action(async (symbol: string, options: { chain: ChainId; interval: string }) => {
    const sentinel = new StableSentinel();
    const intervalMs = parseInt(options.interval) * 1000;

    console.log(chalk.bold(`\n👁️  Watching ${symbol.toUpperCase()} on ${options.chain}`));
    console.log(chalk.gray(`Updates every ${options.interval} seconds. Press Ctrl+C to stop.\n`));

    const check = async () => {
      try {
        const health = await sentinel.getHealth(symbol.toUpperCase(), options.chain);
        console.clear();
        console.log(chalk.bold(`\n👁️  Watching ${symbol.toUpperCase()} on ${options.chain}`));
        console.log(chalk.gray(`Last update: ${new Date().toLocaleTimeString()}\n`));
        displayHealthReport(health, false);
      } catch (error) {
        console.error(chalk.red((error as Error).message));
      }
    };

    // Initial check
    await check();

    // Set up interval
    setInterval(check, intervalMs);
  });

/**
 * Display health report
 */
function displayHealthReport(health: HealthReport, showTimestamp: boolean = true) {
  // Status indicator
  const statusColor = getStatusColor(health.status);
  const statusIcon = getStatusIcon(health.status);
  
  console.log(chalk.bold(`${statusIcon} ${health.symbol} Health Report`));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  // Basic info
  console.log(`${chalk.bold('Status:')}      ${chalk[statusColor](health.status.toUpperCase())}`);
  console.log(`${chalk.bold('Price:')}       ${formatCurrency(health.price)}`);
  console.log(`${chalk.bold('Deviation:')}   ${formatPercentage(health.deviation)}`);
  console.log(`${chalk.bold('Risk Score:')}  ${getRiskScoreDisplay(health.riskScore)} ${chalk.gray(`(${health.riskLevel})`)}`);
  console.log(`${chalk.bold('Chain:')}       ${health.chain}`);
  
  if (showTimestamp) {
    console.log(`${chalk.bold('Timestamp:')}   ${new Date(health.timestamp * 1000).toLocaleString()}`);
  }

  // Alerts
  if (health.alerts.length > 0) {
    console.log();
    console.log(chalk.bold('⚠️  Alerts:'));
    health.alerts.forEach((alert) => console.log(`  ${alert}`));
  }

  console.log();
}

/**
 * Display health table for multiple stablecoins
 */
function displayHealthTable(reports: HealthReport[]) {
  const table = new Table({
    head: [
      chalk.cyan('Symbol'),
      chalk.cyan('Price'),
      chalk.cyan('Deviation'),
      chalk.cyan('Risk Score'),
      chalk.cyan('Status'),
      chalk.cyan('Alerts'),
    ],
    colWidths: [10, 12, 12, 15, 12, 10],
  });

  for (const report of reports) {
    const statusColor = getStatusColor(report.status);
    const statusIcon = getStatusIcon(report.status);

    table.push([
      chalk.bold(report.symbol),
      formatCurrency(report.price),
      formatPercentage(report.deviation),
      getRiskScoreDisplay(report.riskScore),
      chalk[statusColor](statusIcon + ' ' + report.status),
      report.alerts.length.toString(),
    ]);
  }

  console.log(table.toString());
  console.log();
}

/**
 * Display detailed risk report
 */
function displayDetailedRiskReport(health: HealthReport) {
  displayHealthReport(health);

  console.log(chalk.bold('📊 Risk Metrics:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  const metrics = health.metrics;
  console.log(`${chalk.bold('Price Deviation:')}    ${metrics.priceDeviation.toFixed(1)}/100`);
  console.log(`${chalk.bold('Liquidity Score:')}    ${metrics.liquidityScore.toFixed(1)}/100`);
  console.log(`${chalk.bold('Volatility Score:')}   ${metrics.volatilityScore.toFixed(1)}/100`);
  console.log(`${chalk.bold('Volume Score:')}       ${metrics.volumeScore.toFixed(1)}/100`);
  
  if (metrics.collateralScore !== undefined) {
    console.log(`${chalk.bold('Collateral Score:')}   ${metrics.collateralScore.toFixed(1)}/100`);
  }

  console.log();
  console.log(chalk.bold('💧 Liquidity Info:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  const liquidity = health.liquidity;
  console.log(`${chalk.bold('Total Liquidity:')}   ${formatLargeNumber(liquidity.totalLiquidity)}`);
  console.log(`${chalk.bold('Buy Depth:')}         ${formatLargeNumber(liquidity.depth.buy)}`);
  console.log(`${chalk.bold('Sell Depth:')}        ${formatLargeNumber(liquidity.depth.sell)}`);
  console.log(`${chalk.bold('1% Slippage:')}       ${formatPercentage(liquidity.slippage.onePercent * 100)}`);

  console.log();
}

/**
 * Get color for status
 */
function getStatusColor(status: string): 'green' | 'yellow' | 'red' {
  switch (status) {
    case 'healthy':
      return 'green';
    case 'warning':
      return 'yellow';
    case 'critical':
    case 'depegged':
      return 'red';
    default:
      return 'yellow';
  }
}

/**
 * Get icon for status
 */
function getStatusIcon(status: string): string {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'critical':
    case 'depegged':
      return '🚨';
    default:
      return '❓';
  }
}

/**
 * Get colored risk score display
 */
function getRiskScoreDisplay(score: number): string {
  const scoreStr = `${score}/100`;
  if (score >= 70) return chalk.red(scoreStr);
  if (score >= 40) return chalk.yellow(scoreStr);
  return chalk.green(scoreStr);
}

// Parse CLI arguments
program.parse();

