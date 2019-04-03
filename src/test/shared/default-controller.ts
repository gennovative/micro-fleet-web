import { decorators as dec, Request, Response } from '../../app'

@dec.controller()
class DefaultController {
    @dec.GET()
    public doGet(req: Request, res: Response): void {
        res.send('DefaultController.doGet')
    }

    @dec.POST()
    public doPost(req: Request, res: Response): void {
        res.send('DefaultController.doPost')
    }

    @dec.PATCH()
    public doPatch(req: Request, res: Response): void {
        res.send('DefaultController.doPatch')
    }

    @dec.PUT()
    public doPut(req: Request, res: Response): void {
        res.send('DefaultController.doPut')
    }

    @dec.DELETE()
    public doDelete(req: Request, res: Response): void {
        res.send('DefaultController.doDelete')
    }

    @dec.HEAD()
    public doHead(req: Request, res: Response): void {
        res.send('DefaultController.doHead')
    }

    @dec.OPTIONS()
    public doOptions(req: Request, res: Response): void {
        res.send('DefaultController.doOptions')
    }

    @dec.GET()
    @dec.POST()
    @dec.PATCH()
    @dec.PUT()
    @dec.DELETE()
    @dec.HEAD()
    @dec.OPTIONS()
    public doMany(req: Request, res: Response): void {
        res.send('DefaultController.doMany')
    }

    @dec.ALL()
    public doAll(req: Request, res: Response): void {
        res.send('DefaultController.doAll')
    }

    /**
     * Intentionally no action decorator
     */
    public doSecret(req: Request, res: Response): void {
        res.send('DefaultController.doSecret')
    }
}

module.exports = {
    DefaultController,
}
