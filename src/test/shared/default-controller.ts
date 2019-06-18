import { decorators as d, Response } from '../../app'

@d.controller()
class DefaultController {
    @d.GET()
    public doGet(@d.response() res: Response): void {
        res.send('DefaultController.doGet')
    }

    @d.POST()
    public doPost(@d.response() res: Response): void {
        res.send('DefaultController.doPost')
    }

    @d.PATCH()
    public doPatch(@d.response() res: Response): void {
        res.send('DefaultController.doPatch')
    }

    @d.PUT()
    public doPut(@d.response() res: Response): void {
        res.send('DefaultController.doPut')
    }

    @d.DELETE()
    public doDelete(@d.response() res: Response): void {
        res.send('DefaultController.doDelete')
    }

    @d.HEAD()
    public doHead(@d.response() res: Response): void {
        res.send('DefaultController.doHead')
    }

    @d.OPTIONS()
    public doOptions(@d.response() res: Response): void {
        res.send('DefaultController.doOptions')
    }

    @d.GET()
    @d.POST()
    @d.PATCH()
    @d.PUT()
    @d.DELETE()
    @d.HEAD()
    @d.OPTIONS()
    public doMany(@d.response() res: Response): void {
        res.send('DefaultController.doMany')
    }

    @d.ALL()
    public doAll(@d.response() res: Response): void {
        res.send('DefaultController.doAll')
    }

    /**
     * Intentionally no action decorator
     */
    public doSecret(@d.response() res: Response): void {
        res.send('DefaultController.doSecret')
    }
}

module.exports = {
    DefaultController,
}
