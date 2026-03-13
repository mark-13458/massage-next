import de from '../messages/de.json'
import en from '../messages/en.json'
import { Locale } from './i18n'

const messages = { de, en }

export function getMessages(locale: Locale) {
  return messages[locale]
}
