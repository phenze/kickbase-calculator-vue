import { KickbaseLeague } from '@/model/KickbaseLeague'
import { KickbasePlayer } from '@/model/KickbasePlayer'
import { useAppStore } from '@/stores/app'
import Axios from 'axios'

const axios = Axios.create({
    baseURL: 'https://api.kickbase.com/v4'
})


axios.interceptors.request.use(async (request) => {
    if (request.url?.indexOf('/login') === -1) {
        const appStore = useAppStore()
        const token = appStore.token
        request.headers['Authorization'] = 'Bearer ' + token
    }
    return request
})

export async function getLeagues(): Promise<KickbaseLeague[]> {
    try {
        const res = await axios.get(
            `/leagues/selection`
        )
        if (res.data !== undefined && res.data !== '') {
            return res.data['it']
        } else {
            return []
        }
    } catch (err: unknown) {
        console.log(`error during loading getLeagues`, err)
        throw err
    }
}

export async function getSquad(league: string): Promise<KickbasePlayer[]> {
    try {
        const res = await axios.get(
            `/leagues/${league}/squad`
        )
        if (res.data !== undefined && res.data !== '') {
            return res.data['it']
        } else {
            return []
        }
    } catch (err: unknown) {
        console.log(`error during loading getLeagues`, err)
        throw err
    }
}

export async function sendLoginRequest(username: string, password: string): Promise<boolean> {
    try {
        const payload = {
            'ext': true,
            'em': username,
            'loy': false,
            'pass': password,
        }
        const res = await axios.post(
            `/user/login`,
            payload
        )
        if (res.data !== undefined && res.data !== '') {
            const token = res['data']['tkn']
            const appStore = useAppStore()
            appStore.setToken(token)
            return true
        } else {
            return false
        }
    } catch (err: unknown) {
        console.log(`error during loading sendLoginRequest`, err)
        throw err
    }
}