const SettingsException = require('../errors/SettingsException')

const TYPE_INTEGER = 'integer'
const TYPE_ARRAY_STRING = 'arraystring'
const TYPE_REGEX = 'regex'
const TYPE_STRING = 'string'

const settings = {
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
exports.getSetting = function (key) {
  if (!(key in settings)) {
    throw new SettingsException()
  }
  let value = null
  if (key in process.env) {
    value = process.env[key]
  } else {
    value = settings[key].default
  }

  return processValue(key, value)
}

const processValue = function (setting, value) {
  switch (settings[setting].type) {
    case TYPE_STRING:
      return processString(value)
    case TYPE_INTEGER:
      return processInteger(value)
    case TYPE_ARRAY_STRING:
      return processStringArray(value)
    case TYPE_REGEX:
      return processRegExValue(value)
    default:
      throw new SettingsException()
  }
}

const processString = function (value) {
  if (value === '' || value == null) {
    return null
  }
  return value.toString()
}

const processInteger = function (value) {
  return parseInt(value)
}

const processStringArray = function (value) {
  return value.split(',')
}

const processRegExValue = function (value) {
  return new RegExp(value)
}
