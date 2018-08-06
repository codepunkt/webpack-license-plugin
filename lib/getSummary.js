const getSummary = licenseInfo => {
  return licenseInfo.reduce((summary, pckg) => {
    if (summary[pckg.license]) {
      summary[pckg.license] += 1
    } else {
      summary[pckg.license] = 1
    }

    return summary
  }, {})
}

module.exports = getSummary
