import {useRef} from "react";
import _ from "@lodash";

const useDebounce = (func: any, wait: any, options?: any) => useRef(_.debounce(func, wait, options)).current;

export default useDebounce;
