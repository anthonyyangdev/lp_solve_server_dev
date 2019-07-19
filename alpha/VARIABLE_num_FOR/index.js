const loops = [
  {
    name: 'x',
    start: 1,
    end: 4,
    current: 1
  }, {
    name: 'p',
    start: 1,
    end: 2,
    current: 1
  }, {
    name: 'z',
    start: 1,
    end: 3,
    current: 1
  }
]
const expected = 4 * 2 * 3


function loop(arr, func, init) {

  function helper(arr, func, init, arr2) {
    if (arr.length === 0)
      return func(init, arr2)
    while (arr[0].current <= arr[0].end) {
      init = helper(arr.slice(1), func, init, arr2)
      arr[0].current++
    }
    arr[0].current = arr[0].start
    return init
  }
  return helper(arr, func, init, arr)
}

const actual = loop(loops, (value, vars) => {
  let str = ''
  for (let e of vars) {
    str += `${e.current}`
  }
  return `${value} ${str}`
}, '')

console.log(actual)