import * as renderer from "./src/index";
import {makeEntities} from './src/entities'

const entities = makeEntities()

renderer.engine.run()

// const update = () => {
//     physics.update(entities)
//
// }
//
// physics.onLoad(() => {
//     physics.init(entities)
//     update()
// })