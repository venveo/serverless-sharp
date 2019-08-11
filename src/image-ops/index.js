const adjustment = require('./adjustment')
const size = require('./size')

const operationsByCategory = {
  size: size.apply,
  adjustment: adjustment.apply
}

exports.apply = async (image, edits) => {
  const editsByCategory = {}
  for (const edit in edits) {
    if (edits.hasOwnProperty(edit)) {
      if (editsByCategory[edits[edit].schema.category] === undefined) {
        editsByCategory[edits[edit].schema.category] = {}
      }
      editsByCategory[edits[edit].schema.category][edit] = edits[edit]
    }
  }

  for (const category in editsByCategory) {
    if (editsByCategory.hasOwnProperty(category) && operationsByCategory.hasOwnProperty(category)) {
      await operationsByCategory[category](image, edits)
    }
  }
}
