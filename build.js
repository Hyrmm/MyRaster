import * as rollup from "rollup"
import config from "./rollup.config.mjs"

rollup.rollup(config).then(bundle => { bundle.write(config.output) })


