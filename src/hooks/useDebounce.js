import { useEffect, useState } from "react";

export function useDeBounce(value,delay=1000){
 const [debounceValue,setDebounceValue] = useState(value);
 useEffect(()=>{
    let reTrigger = false;
    let timer;
    if(!reTrigger){
        timer = setTimeout(()=>{
            setDebounceValue(value)
        },delay)
    }
    return ()=>{
        reTrigger = true;
        clearTimeout(timer)
    }

 },[value,delay]);
 return debounceValue
}