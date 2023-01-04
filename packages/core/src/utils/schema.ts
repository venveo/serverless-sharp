import schema from '../../../../data/schema.json'
import { Imgix } from '../types/imgix';

export function getSchema(): Imgix {
  return <Imgix>schema;
}