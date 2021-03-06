import React, { useReducer, useMemo, useEffect, useCallback } from 'react';
import './Home.css';
import Form from '../componenets/Form/Form';
import List from '../componenets/List/List';
import Search from '../componenets/Search/Search';
import ErrorBox from '../componenets/ErrorBox/ErrorBox';
import useHttp from '../hooks/http';

const taskReducer = (currentTasks, action) => {
    switch (action.type) {
        case 'SET':
            return action.tasks;
        case 'ADD':
            const addTask = action.task;
            addTask["id"] = action.id['name'];
            return [...currentTasks, addTask];
        case 'DELETE':
            return currentTasks.filter(elem => elem.id !== action.id);
        default:
            throw new Error('new errorrr!')
    }
}

const Home = () => {
    const [userTasks, dispatch] = useReducer(taskReducer, []);
    const {
        isLoading,
        error,
        responseData,
        sendRequest,
        values,
        reqIdentifer,
        clear
    } = useHttp();

    useEffect(() => {
        if (reqIdentifer === 'REMOVE_TASK') dispatch({ type: 'DELETE', id: values });
        if (reqIdentifer === 'ADD_TASK') dispatch({ type: 'ADD', task: values, id: responseData });
        if (reqIdentifer === 'SET_TASK') {
            const loadedTasks = [];
            for (const key in responseData) {
                loadedTasks.push({
                    id: key,
                    date: responseData[key].date,
                    group: responseData[key].group,
                    priority: responseData[key].priority,
                    task: responseData[key].task,
                });
                dispatch({ type: 'SET', tasks: loadedTasks });
            }
        }
    }, [responseData, values, reqIdentifer, isLoading, error])

    const addTaskHandler = useCallback(values => {
        sendRequest(
            'https://react-hooks-e1106.firebaseio.com/tasks.json',
            'POST',
            JSON.stringify(values),
            values,
            'ADD_TASK'
        );
    }, [sendRequest]);

    const removeTaskHandler = useCallback(taskId => {
        sendRequest(
            `https://react-hooks-e1106.firebaseio.com/tasks/${taskId}.json`,
            'DELETE',
            null,
            taskId,
            'REMOVE_TASK'
        );
    }, [sendRequest]);

    const filteredTasks = useCallback(enteredFilter => {
        const query = enteredFilter.length === 0 ? '' : `?orderBy="group"&equalTo="${enteredFilter}"`;
        sendRequest(
            'https://react-hooks-e1106.firebaseio.com/tasks.json' + query,
            'GET',
            null,
            null,
            'SET_TASK'
        );
    }, [sendRequest])

    const MyTaskList = useMemo(() => {
        return (
            <List tasks={userTasks} onRemoveTask={removeTaskHandler} />
        )
    }, [userTasks, removeTaskHandler]);

    return (
        <div className='home-container'>
            {error && <ErrorBox onClose={clear}>{error}</ErrorBox>}
            <div className='home-form'>
                <Form onAddTask={addTaskHandler} isLoading={isLoading} />
                <Search onLoadingTasks={filteredTasks} />
            </div>
            <div className='home-list'>
                {MyTaskList}
            </div>

        </div>
    );
};

export default Home;