const adjustment = require('./adjustment')
const size = require('./size')
const stylize = require('./stylize')

const operationsByCategory = {
  size: size.apply,
  stylize: stylize.apply
  // adjustment: adjustment.apply
}

exports.apply = async (image, edits) => {
  const editsByCategory = {}
  for (const edit in edits) {
    if (editsByCategory[edits[edit].schema.category] === undefined) {
      editsByCategory[edits[edit].schema.category] = {}
    }
    editsByCategory[edits[edit].schema.category][edit] = edits[edit]
  }

  for (const category in editsByCategory) {
    if (editsByCategory[category] !== undefined && operationsByCategory[category] !== undefined) {
      await operationsByCategory[category](image, edits)
    }
  }
}
