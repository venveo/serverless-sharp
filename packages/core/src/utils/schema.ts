import schemaFile from '../../../../data/schema.json'
import { Imgix } from '../types/imgix';

function getSchema(): Imgix {
  return <Imgix>schemaFile;
}

export const schema = getSchema();
