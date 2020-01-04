/// <reference types="reflect-metadata" />

import { CriticalException, Guard, decorators as d } from '@micro-fleet/common'

import { MetaData } from '../constants/MetaData'


export type ControllerDecorator = (path?: string) => Function


/**
 * Used to decorate REST controller class.
 * @param {string} path Segment of URL pointing to this controller.
 *         If not specified, it is extracted from controller class name: {path}Controller,
 *         and converted to all lowercase.
 */
export function controller(path?: string): ClassDecorator {
    return function (targetClass: Function): any {
        if (Reflect.hasOwnMetadata(MetaData.CONTROLLER, targetClass)) {
            throw new CriticalException('Duplicate controller decorator')
        }
        d.decorate(d.injectable(), targetClass)

        if (!path) {
            // Extract path from controller name.
            // Only if controller name is in format {xxx}Controller.
            path = targetClass.name.match(/(.+)Controller$/)[1]
            path = path[0].toLowerCase() + path.substring(1) // to camel case
            path = `/${path}`
            Guard.assertIsDefined(path, 'Cannot automatically extract path, make sure controller name has "Controller" suffix!')
        } else if (path.length > 1) {
            if (!path.startsWith('/')) {
                // Add heading slash
                path = '/' + path
            }
            if (path.endsWith('/')) {
                // Remove trailing slash
                path = path.substr(0, path.length - 1)
            }
        }

        Reflect.defineMetadata(MetaData.CONTROLLER, [path], targetClass)

        return targetClass
    }
}
