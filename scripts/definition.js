const definitionFn = require('../../../../scripts/definition')

definitionFn(content => content.replace(
        "'@micro-fleet/web/dist/app/decorators/index'",
        "'@micro-fleet/web/dist/app/decorators'",
    )
)