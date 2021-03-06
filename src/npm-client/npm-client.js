// @flow
import childProcessP from 'child-process-promise';
import R, { mapObjIndexed, isNil, pipe, values, merge, toPairs, map, join, is } from 'ramda';
import decamelize from 'decamelize';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

const exec = childProcessP.exec;
const objectToArray = obj => map(join('@'), toPairs(obj));
const rejectNils = R.reject(isNil);

type Options = {
  cwd?: string,
  global?: boolean,
  save?: boolean,
  saveDev?: boolean,
  saveOptional?: boolean,
  saveExact?: boolean,
  saveBundle?: boolean,
  force?: boolean,
  dryRun?: boolean,
  ignoreScripts?: boolean,
  legacyBundling?: boolean,
  noOptional?: boolean,
  noShrinkwrap?: boolean
};

const defaults = {
  cwd: process.cwd(),
  global: false,
  save: false,
  saveDev: false,
  saveOptional: false,
  saveExact: false,
  saveBundle: false,
  force: false,
  dryRun: false,
  ignoreScripts: false,
  legacyBundling: false,
  noOptional: false,
  noShrinkwrap: false
};

const camelCaseToOptionCase = optName => '--' + decamelize(optName, '-'); // eslint-disable-line

const serializeOption = (bool, optName) => {
  if (optName === 'cwd') return null;
  if (!bool) return null;
  return camelCaseToOptionCase(optName);
};

const installAction = (
  modules: string[] | string | { [string]: number | string },
  userOpts?: Options,
  verbose: boolean
) => {
  const options = merge(defaults, userOpts);
  const flags = pipe(mapObjIndexed(serializeOption), rejectNils, values)(options);

  // taking care of object case
  modules = is(Object, modules) && !Array.isArray(modules) ? objectToArray(modules) : modules;
  // taking care of string and no modules cases
  // $FlowFixMe
  modules = Array.isArray(modules) ? modules : (modules && [modules]) || []; // eslint-disable-line

  const serializedModules = modules && modules.length > 0 ? ` ${modules.join(' ')}` : '';
  const serializedFlags = flags && flags.length > 0 ? ` ${flags.join(' ')}` : '';

  fs.ensureDirSync(path.join(options.cwd, 'node_modules'));
  const commandToExecute = `npm install${serializedModules}${serializedFlags}`;
  return exec(commandToExecute, { cwd: options.cwd }).then(({ stdout, stderr }) => {
    // if (error) return reject(error);
    // This is an hack until we will upgrade to npm5 (don't know the exact version)
    // In npm5 they improved the output to be something like:
    // npm added 125, removed 32, updated 148 and moved 5 packages.
    // see more info here:
    // https://github.com/npm/npm/pull/15914
    // https://github.com/npm/npm/issues/10732
    // if (!verbose) {
    stdout = `successfully ran ${commandToExecute}`;
    // }

    return { stdout, stderr };
  });
};
const printResults = ({ stdout, stderr }: { stdout: string, stderr: string }) => {
  console.log(chalk.yellow(stdout)); // eslint-disable-line
  console.log(chalk.yellow(stderr)); // eslint-disable-line
};

export default {
  install: installAction,
  printResults
};
