import * as helpers from './helpers'

describe('helpers', () => {
    describe('truncateText', () => {
        it('returns the same text if it is shorter than the maxLength', () => {
            const text = 'Short text'
            const result = helpers.truncateText(text, 100)
            expect(result).toBe(text)
        })

        it('returns the same text if it is exactly the maxLength', () => {
            const text = 'Exact length text'
            const maxLength = text.length
            const result = helpers.truncateText(text, maxLength)
            expect(result).toBe(text)
        })

        it('truncates the text at the last space before maxLength', () => {
            const text = 'This is a longer text that needs to be truncated'
            const result = helpers.truncateText(text, 20)
            expect(result).toBe('This is a longer')
        })

        it('truncates the text exactly at maxLength if there is no space', () => {
            const text = 'ThisIsALongWordThatExceedsMaxLength'
            const result = helpers.truncateText(text, 10)
            expect(result).toBe('ThisIsALon')
        })

        it('returns undefined if text is undefined', () => {
            const result = helpers.truncateText(undefined, 10)
            expect(result).toBeUndefined()
        })

        it('returns the text as is if maxLength is greater than text length', () => {
            const text = 'Sample text'
            const result = helpers.truncateText(text, 100)
            expect(result).toBe(text)
        })

        it('handles text with multiple spaces correctly', () => {
            const text = 'This   is    a   test   with  multiple   spaces'
            const result = helpers.truncateText(text, 15)
            expect(result).toBe('This   is    a ')
        })

        it('handles empty string correctly', () => {
            const text = ''
            const result = helpers.truncateText(text, 10)
            expect(result).toBe('')
        })

        it('handles zero maxLength correctly', () => {
            const text = 'This is a test'
            const result = helpers.truncateText(text, 0)
            expect(result).toBe('')
        })
    })

    describe('encodeQueryData', () => {
        it('returns an empty string if data is undefined', () => {
            const result = helpers.encodeQueryData(undefined)
            expect(result).toBe('')
        })

        it('returns an empty string if data is null', () => {
            const result = helpers.encodeQueryData(null)
            expect(result).toBe('')
        })

        it('returns an empty string if data is an empty object', () => {
            const result = helpers.encodeQueryData({})
            expect(result).toBe('')
        })

        it('encodes a single key-value pair correctly', () => {
            const data = { key: 'value' }
            const result = helpers.encodeQueryData(data)
            expect(result).toBe('?key=value')
        })

        it('encodes multiple key-value pairs correctly', () => {
            const data = { key1: 'value1', key2: 'value2' }
            const result = helpers.encodeQueryData(data)
            expect(result).toBe('?key1=value1&key2=value2')
        })

        it('encodes special characters correctly', () => {
            const data = {
                'another&key': 'value/with?special#chars',
                'special key': 'value with spaces'
            }
            const result = helpers.encodeQueryData(data)
            expect(result).toBe(
                '?another%26key=value%2Fwith%3Fspecial%23chars&special%20key=value%20with%20spaces'
            )
        })

        it('ignores keys with undefined or null values', () => {
            const data = {
                key1: 'value1',
                key2: undefined,
                key3: null,
                key4: 'value4'
            }
            const result = helpers.encodeQueryData(data)
            expect(result).toBe('?key1=value1&key4=value4')
        })

        it('handles numeric values correctly', () => {
            const data = { key1: 123, key2: 456.789 }
            const result = helpers.encodeQueryData(data)
            expect(result).toBe('?key1=123&key2=456.789')
        })

        it('handles boolean values correctly', () => {
            const data = { key1: true, key2: false }
            const result = helpers.encodeQueryData(data)
            expect(result).toBe('?key1=true')
        })

        it('ignores keys with empty string values', () => {
            const data = { key1: 'value1', key2: '' }
            const result = helpers.encodeQueryData(data)
            expect(result).toBe('?key1=value1')
        })
    })

    describe('makeActiveLink', () => {
        it('returns an empty string if the input link is empty', () => {
            const result = helpers.makeActiveLink('')
            expect(result).toBe('')
        })

        it('returns the link unchanged if it already starts with http://', () => {
            const link = 'http://example.com'
            const result = helpers.makeActiveLink(link)
            expect(result).toBe(link)
        })

        it('returns the link unchanged if it already starts with https://', () => {
            const link = 'https://example.com'
            const result = helpers.makeActiveLink(link)
            expect(result).toBe(link)
        })

        it('prepends https:// to the link if it does not start with http:// or https://', () => {
            const link = 'example.com'
            const result = helpers.makeActiveLink(link)
            expect(result).toBe('https://example.com')
        })

        it('handles links with special characters correctly', () => {
            const link = 'example.com/path?query=string#hash'
            const result = helpers.makeActiveLink(link)
            expect(result).toBe('https://example.com/path?query=string#hash')
        })

        it('prepends https:// to a link with www.', () => {
            const link = 'www.example.com'
            const result = helpers.makeActiveLink(link)
            expect(result).toBe('https://www.example.com')
        })

        it('does not modify a link that is already complete with https:// and additional paths/queries', () => {
            const link = 'https://www.example.com/path?query=string#hash'
            const result = helpers.makeActiveLink(link)
            expect(result).toBe(link)
        })

        it('does not modify a link that is already complete with http:// and additional paths/queries', () => {
            const link = 'http://www.example.com/path?query=string#hash'
            const result = helpers.makeActiveLink(link)
            expect(result).toBe(link)
        })
    })

    describe('equalsArrays', () => {
        it('returns true if both arrays are undefined or empty', () => {
            expect(helpers.equalsArrays(undefined, undefined)).toBe(true)
            expect(helpers.equalsArrays([], [])).toBe(true)
            expect(helpers.equalsArrays(undefined, [])).toBe(true)
            expect(helpers.equalsArrays([], undefined)).toBe(true)
        })

        it('returns false if one array is empty or undefined and the other is not', () => {
            expect(helpers.equalsArrays(['a'], undefined)).toBe(false)
            expect(helpers.equalsArrays(undefined, ['a'])).toBe(false)
            expect(helpers.equalsArrays(['a'], [])).toBe(false)
            expect(helpers.equalsArrays([], ['a'])).toBe(false)
        })

        it('returns true if both arrays contain the same elements in the same order', () => {
            expect(helpers.equalsArrays(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(
                true
            )
        })

        it('returns true if both arrays contain the same elements in different orders', () => {
            expect(helpers.equalsArrays(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(
                true
            )
        })

        it('returns false if arrays contain different elements', () => {
            expect(helpers.equalsArrays(['a', 'b', 'c'], ['a', 'b', 'd'])).toBe(
                false
            )
            expect(helpers.equalsArrays(['a', 'b', 'c'], ['a', 'b'])).toBe(
                false
            )
        })

        it('returns false if arrays contain the same elements with different lengths', () => {
            expect(
                helpers.equalsArrays(['a', 'b', 'c'], ['a', 'b', 'c', 'd'])
            ).toBe(false)
        })

        it('returns false if arrays contain duplicate elements in one array but not the other', () => {
            expect(
                helpers.equalsArrays(['a', 'b', 'c'], ['a', 'a', 'b', 'c'])
            ).toBe(false)
        })

        it('returns true for arrays with different references but same content', () => {
            const array1 = ['a', 'b', 'c']
            const array2 = ['a', 'b', 'c']
            expect(helpers.equalsArrays(array1, array2)).toBe(true)
        })
    })
})
