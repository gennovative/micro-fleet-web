import { decorators as d, Response } from '../../app'


@d.controller('/')
class SampleController {
    @d.GET('/')
    public getSample(@d.response() res: Response): void {
        res.send('SampleController.getSample')
    }
}

module.exports = {
    SampleController,
}
