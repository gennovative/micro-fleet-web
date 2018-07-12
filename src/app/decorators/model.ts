import { ModelFilter, ModelFilterOptions } from '../filters/ModelFilter';
import { addFilterToTarget, FilterPriority } from './filter';


export type ModelDecorator = (opts: ModelFilterOptions) => Function;


/**
 * Marks a controller or action to require auth token to be accessible.
 */
export function model(opts: ModelFilterOptions): Function {
	return function (TargetClass: Newable, key: string): Function {
		TargetClass = addFilterToTarget<ModelFilter>(ModelFilter, TargetClass, key, FilterPriority.HIGH, opts) as Newable;
		return TargetClass;
	};
}