export function browserCodecList(codecs) {
  return codecs.map((codec) => ({
    text: codec.sdpFmtpLine ? `${codec.mimeType} (${codec.sdpFmtpLine})` : codec.mimeType,
    value: JSON.stringify(codec),
  }))
}

export function sortByOrder(options, order) {
  return options.sort((a, b) => {
    const ai = order.findIndex((k) => a.text.includes(k))
    const bi = order.findIndex((k) => b.text.includes(k))
    return ai - bi
  })
}
