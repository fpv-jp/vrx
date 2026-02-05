/**
 * RTCRtpCodecCapability 配列をドロップダウン用リスト形式に変換する
 * @param {RTCRtpCodecCapability[]} codecs
 * @returns {{ text: string, value: string }[]}
 */
export function browserCodecList(codecs) {
  return codecs.map((codec) => ({
    text: codec.sdpFmtpLine ? `${codec.mimeType} (${codec.sdpFmtpLine})` : codec.mimeType,
    value: JSON.stringify(codec),
  }))
}

/**
 * order 配列のキーワード順にコーデックオプションをソートする
 * @param {{ text: string, value: string }[]} options
 * @param {string[]} order - 優先キーワード順（先頭が最優先）
 * @returns {{ text: string, value: string }[]}
 */
export function sortByOrder(options, order) {
  return options.sort((a, b) => {
    const ai = order.findIndex((k) => a.text.includes(k))
    const bi = order.findIndex((k) => b.text.includes(k))
    return ai - bi
  })
}
