import { decorators as d, Response } from '../../app'


@d.controller('custom')
class CustomController {
    @d.GET('get-it')
    public doGet(@d.response() res: Response): void {
        res.send('CustomController.doGet')
    }

    @d.POST('post-it/')
    public doPost(@d.response() res: Response): void {
        res.send('CustomController.doPost')
    }

    @d.PATCH('/patch-it')
    public doPatch(@d.response() res: Response): void {
        res.send('CustomController.doPatch')
    }

    @d.PUT('/put-it/')
    public doPut(@d.response() res: Response): void {
        res.send('CustomController.doPut')
    }

    @d.DELETE('/del-it/')
    public doDelete(@d.response() res: Response): void {
        res.send('CustomController.doDelete')
    }

    @d.HEAD('head-it')
    public doHead(@d.response() res: Response): void {
        res.send('CustomController.doHead')
    }

    @d.OPTIONS('/opt-it')
    public doOptions(@d.response() res: Response): void {
        res.send('CustomController.doOptions')
    }

    @d.GET('get-many')
    @d.POST('post-many/')
    @d.PATCH('/patch-many')
    @d.PUT('/put-many/')
    @d.DELETE('/del-many/')
    @d.HEAD('head-many')
    @d.OPTIONS('/opt-many')
    public doMany(@d.response() res: Response): void {
        res.send('CustomController.doMany')
    }

    @d.ALL('/do-all')
    public doAll(@d.response() res: Response): void {
        res.send('CustomController.doAll')
    }
}

module.exports = {
    CustomController,
}
