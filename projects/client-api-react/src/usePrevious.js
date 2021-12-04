import React, { useRef, useEffect } from 'react' // eslint-disable-line no-unused-vars


//https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export { usePrevious };