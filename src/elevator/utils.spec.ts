import { describe, it, expect } from 'vitest'
import { doesArrayIncludeLargerNumber, doesArrayIncludeSmallerNumber } from './utils'


describe('Utils', () => {
  it('Checks if an array includes a larger number than the specified number', () => {
     let doesInclude = doesArrayIncludeLargerNumber(5,[1,5,5,3])
     expect(doesInclude).toBe(false)

     doesInclude = doesArrayIncludeLargerNumber(5,[1,5,5,6])
     expect(doesInclude).toBe(true)

     doesInclude = doesArrayIncludeLargerNumber(0,[0])
     expect(doesInclude).toBe(false)
  })

  it('Checks if an array includes a smaller number than the specified number', () => {
    const doesInclude = doesArrayIncludeSmallerNumber(5,[1,5,5,3])
    expect(doesInclude).toBe(true)
 })
})
