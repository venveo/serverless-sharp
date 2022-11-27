import createHttpError from "http-errors";

const TYPE_INTEGER = 'integer'
const TYPE_ARRAY_STRING = 'arraystring'
const TYPE_REGEX = 'regex'
const TYPE_STRING = 'string'

const settings: { [index: string]: { default: string | number, type: string } } = {
  DEFAULT_QUALITY: {
    default: 75,
    type: TYPE_INTEGER
  },
  DEFAULT_COMPRESS_QUALITY: {
    default: 75,
    type: TYPE_INTEGER
  },
  SLS_IGNORE: {
    default: '',
    type: TYPE_ARRAY_STRING
  },
  SLS_VALID_PATH_REGEX: {
    default: '.*',
    type: TYPE_REGEX
  },
  MAX_IMAGE_WIDTH: {
    default: 2000,
    type: TYPE_INTEGER
  },
  MAX_IMAGE_HEIGHT: {
    default: 1000,
    type: TYPE_INTEGER
  },
  PNGQUANT_SPEED: {
    default: 10,
    type: TYPE_INTEGER
  },
  DEFAULT_CACHE_CONTROL: {
    default: '',
    type: TYPE_STRING
  },
  SOURCE_BUCKET: {
    default: '',
    type: TYPE_STRING
  },
  SECURITY_KEY: {
    default: '',
    type: TYPE_STRING
  },
  CUSTOM_DOMAIN: {
    default: '',
    type: TYPE_STRING
  }
}

/**
 * Gets a setting from the config
 * @param key
 * @return {string|null}
 */
export function getSetting(key: string) {
  if (!(key in settings)) {
    throw new createHttpError.InternalServerError('Unable to locate settings key: '+ key)
  }
  let value: undefined|null|string|number;
  if (key in process.env) {
    value = process.env[key]
  } else {
    value = settings[key].default
  }
  if (value === undefined) {
    throw new createHttpError.InternalServerError(`Value for settings key '${key}' is undefined`)
  }

  return processValue(key, value)
}

const processValue = function (setting: string, value: string | number) {
  switch (settings[setting].type) {
  case TYPE_STRING:
    return processString(value)
  case TYPE_INTEGER:
    return processInteger(value)
  case TYPE_ARRAY_STRING:
    if (typeof value !== "string") {
      throw new createHttpError.InternalServerError(`Expected string for settings value for ${setting}`)
    }
    return processStringArray(value)
  case TYPE_REGEX:
    if (typeof value !== "string") {
      throw new createHttpError.InternalServerError(`Expected string for settings value for ${setting}`)
    }
    return processRegExValue(value)
  default:
    throw new createHttpError.InternalServerError(`Encountered unknown type for settings key ${setting}`)
  }
}

const processString = function (value: string|undefined|null|number|object) {
  if (value === '' || value == null) {
    return null
  }
  return value.toString()
}

const processInteger = function (value: string | number) {
  if (typeof value === "number") {
    return value
  }
  return parseInt(value)
}

const processStringArray = function (value: string) {
  return value.split(',')
}

const processRegExValue = function (value: string): RegExp {
  return new RegExp(value)
}
