import { readdir, stat } from 'fs/promises'
import { dirname, join, relative } from 'path'
import files from './get-routes-files'

export default getCode

async function getCode(folder: string, skip: RegExp, extensions: string[], resourcePath: string) {
  files.add(resourcePath)
  let { pathNameDic, routes } = await getMeta(folder, skip, extensions), lines = [
    `import React, { lazy } from 'react'`,
    `import { Outlet } from 'react-router-dom'`,
    ``,
    `export default ()=>{`
  ], json = JSON.stringify(routes, null, 2)

  for (let [file, name] of pathNameDic.entries()) {
    lines.push(`  let ${name} = lazy(()=>import(${JSON.stringify(relativePath(file))}))`)
    json = json.replaceAll(JSON.stringify(file), `<${name} />`)
  }
  json = json.replaceAll(`"element": ""`, `"element": <Outlet />`)
  lines.push(``)
  lines.push(`  return ${json}`)
  lines.push(`}`)
  return lines.join('\n')

  function relativePath(file: string) {
    let rtn = relative(dirname(resourcePath), file).replaceAll('\\', '/')
    rtn = rtn.startsWith('.') ? rtn : './' + rtn
    return rtn.replace(/\.[^/.]+$/, "")
  }
}

type MetaItem = Partial<{
  path: string,
  element: string,
  index: boolean,
  children: MetaItem[]
}>

async function getMeta(folder: string, skip: RegExp, extensions: string[]) {
  let usedNames = new Set, pathNameDic = new Map
  let root = await loadRecursive(folder, '')
  return {
    pathNameDic,
    routes: root.element ? [root] : root.children
  }

  async function loadRecursive(folder: string, name: string): Promise<MetaItem> {
    let children = [], element = '', paramed = (name.startsWith('[') && name.endsWith(']'))

    for (let file of await readdir(folder)) {
      let fullFile = join(folder, file)
      let fileStat = await stat(fullFile)
      let base = nameWithoutExt(file)
      if (skip.test(file)) continue
      if (fileStat.isFile()) { // file
        if (!extensions.some(x => file.endsWith(x))) continue
        if (base === '_layout') {
          element = fullFile
          pathNameDic.set(fullFile, findName('Layout'))
        } else if (base === 'index') {
          pathNameDic.set(fullFile, findName('Index'))
          children.push({
            index: true,
            element: fullFile,
          })
        } else if (base.endsWith('[]')) {
          const name = base.slice(0, base.length - 2)
          if (!name) {
            pathNameDic.set(fullFile, findName('All'))
            children.push({
              path: `*`,
              element: fullFile,
            })
          }
          else {
            pathNameDic.set(fullFile, findName(name))
            children.push({
              path: `${name}/*`,
              element: fullFile,
            })
          }
        } else {
          let paramed = (base.startsWith('[') && base.endsWith(']'))
          pathNameDic.set(fullFile, findName(paramed ? base.substring(1, base.length - 1) : base))
          children.push({
            path: paramed ? `:${base.substring(1, base.length - 1)}` : base,
            element: fullFile,
          })
        }
      } else { // folder
        children.push(await loadRecursive(join(folder, file), file))
      }
    }

    return {
      path: paramed ? `:${name.substring(1, name.length - 1)}` : name,
      children,
      element
    }
  }

  function findName(name = '') {
    let n = camelize(name, true)
    for (let i = 0; ; i++) {
      let name1 = n + i
      if (!usedNames.has(name1)) {
        usedNames.add(name1)
        return name1
      }
    }
  }

  function nameWithoutExt(file: string) {
    return file.substring(0, file.lastIndexOf('.'))
  }
}

function camelize(input: string, capFirst: boolean = false): string {
  // Remove any characters that are not alphanumeric
  const cleanedInput = input.replace(/[^a-zA-Z0-9]+/g, ' ').trim();

  // Split the input into words
  const words = cleanedInput.split(' ');

  // Capitalize the first character of each word (if capFirst is true)
  const camelizedWords = words.map((word, index) => {
    if (capFirst || index > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    } else {
      return word.toLowerCase();
    }
  });

  // Join the words and return the camelized string
  const camelizedString = camelizedWords.join('');
  return camelizedString;
}
