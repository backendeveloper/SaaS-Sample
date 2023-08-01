'use client';

import _ from "lodash";
import {useCallback, useState} from "react";

const useForm = (initialState: any, onSubmit?: any) => {
    const [form, setForm] = useState(initialState);

    const handleChange = useCallback((event: any) => {
        event.persist();
        setForm((_form: any) =>
            _.setWith(
                { ..._form },
                event.target.name,
                event.target.type === 'checkbox' ? event.target.checked : event.target.value
            )
        );
    }, []);

    const resetForm = useCallback(() => {
        if (!_.isEqual(initialState, form)) {
            setForm(initialState);
        }
    }, [form, initialState]);

    const setInForm = useCallback((name: any, value: any) => {
        setForm((_form: any) => _.setWith(_form, name, value));
    }, []);

    const handleSubmit = useCallback(
        (event: any) => {
            if (event) {
                event.preventDefault();
            }
            if (onSubmit) {
                onSubmit();
            }
        },
        [onSubmit]
    );

    return {
        form,
        handleChange,
        handleSubmit,
        resetForm,
        setForm,
        setInForm,
    };
};

export default useForm;