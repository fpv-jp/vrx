import Alpine from 'alpinejs'
import Constants from '../../constants.js'

const { GSTREAMER } = Constants.Source

/** "30/1" のようなスラッシュ区切り文字列から先頭の整数を返す */
const parsePart = (s) => parseInt(s.split('/')[0])

/**
 * GStreamer caps の `{a,b,c}` 形式の選択肢文字列をオプション配列に変換する
 * @param {string} rawValue - `{opt1,opt2,...}` 形式の文字列
 * @returns {{ text: string, value: string, num: number }[]}
 */
function parseOptions(rawValue) {
  return rawValue
    .slice(1, -1)
    .split(',')
    .map((s) => s.trim())
    .map((opt) => ({ text: opt, value: opt, num: parsePart(opt) }))
    .sort((a, b) => {
      if (isNaN(a.num) && isNaN(b.num)) return 0
      if (isNaN(a.num)) return 1
      if (isNaN(b.num)) return -1
      return b.num - a.num
    })
}

/**
 * GStreamer caps の `[min,max,step]` 形式の範囲文字列をスライダー設定に変換する
 * @param {string} rawValue - `[min,max]` または `[min,max,step]` 形式
 * @returns {{ min: number, max: number, step: number }}
 */
function parseSlider(rawValue) {
  const parts = rawValue.slice(1, -1).split(',').map((s) => s.trim())
  return {
    min: parsePart(parts[0]),
    max: parsePart(parts[1]),
    step: parts.length >= 3 ? parseInt(parts[2]) : 1,
  }
}

/**
 * ストアキーにリスト選択モードとオプションをセットする
 * @param {string} key - ストアキー（`_options` / `_mode` が自動追加される）
 * @param {string} rawValue - `{opt1,opt2,...}` 形式の文字列
 */
export function setListParameterOption(key, rawValue) {
  const store = Alpine.store('menu')
  const options = parseOptions(rawValue)
  store[key + '_options'] = options
  store[key + '_mode'] = 'list'
  if (options.length > 0) store[key] = options[0].value
}

/**
 * ストアキーにスライダーモードと範囲値をセットする
 * @param {string} key - ストアキー
 * @param {string} rawValue - `[min,max]` または `[min,max,step]` 形式
 */
export function setSliderParameterOption(key, rawValue) {
  const store = Alpine.store('menu')
  const { min, max, step } = parseSlider(rawValue)
  store[key + '_min'] = min
  store[key + '_max'] = max
  store[key + '_step'] = step
  store[key + '_mode'] = 'slider'
}

/**
 * 値が数値かテキストかを判定してストアにセットする
 * @param {string} key - ストアキー
 * @param {string} value
 */
export function setTextOrNumberField(key, value) {
  const num = parseInt(value)
  setMenuOptionText(key, isNaN(num) ? value : num)
}

/**
 * ストアキーに値とテキストモードをセットする
 * @param {string} key - ストアキー
 * @param {*} value
 */
export function setMenuOptionText(key, value) {
  const store = Alpine.store('menu')
  store[key] = value
  store[key + '_mode'] = 'text'
}

/**
 * ストアの文字列フィールドから指定パラメータの値を抽出する
 * @param {string} storeKey - 参照するストアキー
 * @param {string} paramKey - 抽出するパラメータ名
 * @returns {string|null}
 */
function getStoreParam(storeKey, paramKey) {
  const match = Alpine.store('menu')[storeKey].match(new RegExp(`${paramKey}=({[^}]+}|\\[[^\\]]+\\]|[^,\\s]+)`))
  return match ? match[1].trim() : null
}

/** video_capture 文字列から指定パラメータ値を取得する */
export const getVideoCaptureParameter = (k) => getStoreParam('video_capture', k)

/** audio_sampling 文字列から指定パラメータ値を取得する */
export const getAudioSamplingParameter = (k) => getStoreParam('audio_sampling', k)

/**
 * 接続に必要なストアキーがすべて選択済みかチェックする
 * @returns {boolean} 未選択キーがある場合 true（connectionDisabled に使用）
 */
export function checkRequiredKeys() {
  const store = Alpine.store('menu')
  const msg = store.message
  let keys = ['video_capture', 'audio_sampling']
  if (msg?.source === GSTREAMER) {
    keys.push('video_device', 'audio_device', 'audio_codec')
    if (typeof store.video_capture === 'string' && store.video_capture.includes('video/x-raw')) {
      keys.push('video_codec')
    }
  }
  return !keys.every((k) => store[k] !== 'none' && store[k] !== '' && store[k] !== 0)
}
