import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

/// Blue print
 interface User{
    name : string,
    email: string,
}

interface UserList{
    selected : User | null,
    isloading : boolean,
    list :  User[] | null,
    error : string | null
 }
// init the blueprint

const initalizeUser : UserList = {
    list : null,
    isloading : false,
    selected :null,
    error :null
}

/// I am API
const userApi = {
    getAll: ()=> axios.get('/api/users'),
    getUserById: (id:{id: number})=> axios.get(`/api/users/${id}`)
}

// I am Thunk
const fetchUsers= createAsyncThunk<User[]>(
    '/api/fetchAll',
    async () => {
       const res = await userApi.getAll();
       return res.data; //assumming the response is basicaly raw user, not wrap by api response
    }
)

const getUser= createAsyncThunk<User, number>(
    '/api/fetchUser',
    async (id: number) => {
       const res = await userApi.getUserById({id});
       return res.data; //assumming the response is basicaly raw user, not wrap by api response
    }
)


// I am slice, and i will secretly listent to Thunk when its dispatch by UI

const userSlice = createSlice({
    name: 'user',
    initialState: initalizeUser,
    reducers: {
        setSelectedUser : (state,action)=>{
            state.selected = action.payload
        },
        setClearSelectedUser : (state)=>{
            state.selected = null
        }
    },
    extraReducers: (builder)=>{
        builder.addCase(fetchUsers.fulfilled,(state,action)=>{
            state.isloading = false;
            state.list = action.payload;
        }),
        builder.addCase(fetchUsers.rejected,(state)=>{
            state.isloading = false;
            state.error = "Failed to load users";
        }),
         builder.addCase(fetchUsers.pending,(state)=>{
            state.isloading = true;
        })
    }
})

export const {setSelectedUser, setClearSelectedUser} = userSlice.actions;
export const selectSelectedUser = (state:any) => state.user.selected;
export const selectUserList = (state:any) => state.user.list;
export const selectUserLoading   = (state: any) => state.user.isloading  
export const selectUserError = (state:any) => state.user.error;

export default userSlice.reducer

