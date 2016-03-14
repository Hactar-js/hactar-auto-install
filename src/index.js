import chalk from 'chalk'
import jscodeshift from 'jscodeshift'
import { exec } from 'child_process'
import path from 'path'
import { parseFile } from 'hactar-util'

const isModuleImport = importDeclaration => {
  if (importDeclaration.match(/\//)
      || importDeclaration.match(/\.\//)
      || importDeclaration.match(/\.[\w]*$/)) {
    return false
  }

  return true
}

const print = output => console.log(output.trim())

/**
 * Holds an array of the modules we are currently installing
 *
 * This is defensive coding against chokidar doing weird things with events
 * I got weird edge cases where ADD events would show up twice.
 * Rther than run an install command twice we just check to make sure we aren't already installing
 */
const installingModules = []

/**
 * Runs a require and if it fails, attempts to install it.
 *
 */
const tryRequireAndInstall = module => {
  if (installingModules.indexOf(module) > -1) {
    return
  }

  installingModules.push(module)

  try {
    require(path.join(process.cwd(), 'node_modules', module))
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      const matches = e.message.match(/'(.*?)'/)

      if (!matches) {
        return
      }

      // TODO: parse things for 404s etc
      let moduleToInstall = matches[0]
      if (moduleToInstall.indexOf('/') > -1) {
        const parts = moduleToInstall.split('/')
        moduleToInstall = parts[parts.length - 1]
      }

      // TODO: Figure our how it is still possible to end up with single quotes in this
      //       because it shouldn't be
      moduleToInstall = moduleToInstall.replace(/\'/g, '')

      console.log(chalk.blue(`installing ${moduleToInstall}`))
      exec(`npm install --save ${moduleToInstall}`, (err, stdout) => {
        if (err) {
          console.log(chalk.red(`could not install ${moduleToInstall}`))
          return
        }

        print(stdout.toString())

        console.log(chalk.green(`installed ${moduleToInstall}`))
        installingModules.splice(installingModules.indexOf(module), 1)
        tryRequireAndInstall(module)
      })
    }
  }
}

const parseImports = action => {
  // The lazy human's subscription.
  // Subscribe them all and only handle CHANGE and ADD events
  if (!(action.type === 'ADD_FILE' || action.type === 'CHANGED_FILE')) {
    return
  }

  let ast
  try {
    ast = parseFile(action.path)
  } catch (e) {
    return
  }

  if (!ast) {
    return
  }

  ast.find(jscodeshift.ImportDeclaration).forEach((importDeclaration) => {
    const modle = importDeclaration.value.source.raw.replace(/['"]/g, '')
    if (!isModuleImport(modle)) {
      return
    }

    tryRequireAndInstall(modle.replace(/\'/g, ''))
  })
}

function* saga(action) {
  parseImports(action)
}

export { saga }
