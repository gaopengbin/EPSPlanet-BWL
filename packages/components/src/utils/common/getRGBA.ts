// 输入rgba字符串，如'rgba(255, 255, 255, 0.5)',
// 返回rgba数组[255, 255, 255, 0.5]
function rgbaStrToArr(str: string) {
  let v = str.split('(')[1].split(')')[0].split(',');
  let cc: any = [];
  v.forEach((c, i) => {
    if (i == 3) {
      cc.push(Number(c));
    } else {
      cc.push(Number(c) / 225.0);
    }
  });
  // console.log(val, v, cc);
  return cc;
}
// 输入rgba数组，返回rgba字符串
function rgbaArrToStr(arr: Array<number>) {
  return `rgba(${arr[0] * 255}, ${arr[1] * 255}, ${arr[2] * 255}, ${arr[3]})`;
}
export { rgbaStrToArr, rgbaArrToStr };
