import React, { useDebugValue, useEffect, useState } from 'react'

export const useLocalStorage = <S>(
    key: string,
    initialState?: S | (() => S)
): [S, React.Dispatch<React.SetStateAction<S>>] => {
    const [state, setState] = useState<S>(initialState as S)

    useDebugValue(state)

    useEffect(() => {
        const item = localStorage.getItem(key)
        setState(item ? parse(item) : null)
    }, [])

    useEffect(() => {
        if (state) {
            localStorage.setItem(key, JSON.stringify(state))
        }
    }, [state])

    return [state, setState]
}

const parse = (value: string) => {
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

export default useLocalStorage
