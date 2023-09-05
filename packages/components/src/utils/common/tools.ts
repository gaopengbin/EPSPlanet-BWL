 
// 深拷贝对象 
export const copyobj = (obj1,obj2) =>{
  let obj = obj2||{};
  for(let name in obj1){
    if(typeof obj1[name] ==="object"){
      obj[name] = (obj1[name].constructor === Array)?[]:{};
      copy(obj1[name],obj[name]);
    }else{
      obj[name] = obj1[name];
    }
  }
  return obj;
}

//向上取整十，整百，整千，整万
export function ceilNumber(number){
  let bite = 0;
  if(number < 10){
    return 10;
  }
  while( number >= 10 ){
    number /= 10;
    bite += 1;
  }
  return Math.ceil(number) * Math.pow(10,bite);
}

