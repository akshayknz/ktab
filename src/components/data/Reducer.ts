import { combineReducers, Dispatch } from 'redux';
import {configureStore} from '@reduxjs/toolkit';

//Goes into ./action-types/index.ts
enum ActionType {
    ADDORG= 'add-organization',
    DELORG= 'delete-organization',
}

//Goes into ./actions/index.ts
const initialState: string[] = []

interface AddOrganizationAction {
    type: ActionType.ADDORG;
    payload: string;
}
interface DeleterganizationAction {
    type: ActionType.DELORG;
    payload: string;
}

type Action = AddOrganizationAction | DeleterganizationAction;

//Goes into ./reducers/orgReducer.ts
const reducer = (state : Array<string> = initialState, action: Action) => {
    switch (action.type) {
        case ActionType.ADDORG:
            return state.push(action.payload? action.payload:"");
        case ActionType.DELORG:
            return state.pop();
        default:
            return state;
    }
}

//Goes into ./reducers/index.ts 
const reducers = combineReducers({
    red: reducer
})

export default reducers;

//Goes into ./action-creators/index.ts
export const addOrganization = (name: string) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.ADDORG,
            payload: name
        })
    }
}
export const deleteOrganization = (name: string) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.DELORG,
            payload: name
        })
    }
}
