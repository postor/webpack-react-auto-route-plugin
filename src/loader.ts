import { join } from 'path'
import getCode from './loader-get-code'

export = function (this: any) {
  this.cacheable && this.cacheable(true)

  const {
    root,
    skip,
    extensions,
  } = this.getOptions()

  const { rootContext } = this

  let callback = this.async()
  getCode(join(rootContext, root as string), skip as RegExp, extensions as string[],this.resourcePath as string).then(code => callback(null, code))
}

