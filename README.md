# webpack-react-auto-route-plugin
auto create react route base on file structure

## how to use

example projects: 
 - [JavaScript version](https://github.com/postor/webpack-react-auto-route-plugin-example) [online preview](https://githubbox.com/postor/webpack-react-auto-route-plugin-example)
 - [TypeScript version](https://github.com/postor/webpack-react-auto-route-plugin-ts-example) [online preview](https://githubbox.com/postor/webpack-react-auto-route-plugin-ts-example )

```
// webpack.config.js
const AutoRoutePlugin = require('react-autot-route-plugin')

module.exports = {
  ...
  plugins:[
    new AutoRoutePlugin({
      root: './src/pages', //route base on structure of './src/pages'
      skip: /^\$*/, // ignore files starts with '$'
      extensions: ['.ts','.tsx','.js','.jsx','.mjs','.cjs'], // only route file with these extensions
      getRoutesFile: /get-routes\.js/, // 
    })
  ]
}
```

```
// src/get-routes.js
export default ()=>[]
```

```
// src/app.tsx
import { createRoot } from "react-dom/client"
import { BrowserRouter, useRoutes } from "react-router-dom"
import getRoutes from 'get-routes'

let routes = getRoutes()
console.log(routes)

const App = () => {
  return useRoutes(routes)
}

createRoot(document.getElementById("react-root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

```

## name rules

files

- `index` = current route, e.g. `/index.js` => `/`
- `xx` = named route, e.g. `/about.js` => `/about`
- `_layout` = all file under same folder, share appear in it's <Outlet />
- `[]` = * route, e.g. `/[].js` => `/*`
- `xx[]` = xx/* route, e.g. `/admin[].js` => `/admin/*`
- [xx] = paramed route, e.g. `/post/[id].js` => `/post/*`, and you can get param via `useParams()`

folders
- `xx` = named route, e.g. `/about/team.js` => `/about/team`
- [xx] = paramed route, e.g. `/post/[id]/comments.js` => `/post/*/comments`, and you can get param via `useParams()`
