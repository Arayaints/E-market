import { HttpService, type IResponse } from "~/core/shared/http"
import type { IAuthResponse, IUser } from "../models/AuthModel"

export class AuthService extends HttpService {
	constructor() {
		super("auth")
	}

	async login(credentials: { username: string; password: string }): Promise<IResponse<IAuthResponse>> {
		return this.post<IAuthResponse>("/login", credentials)
	}

	async getProfile(): Promise<IResponse<IUser>> {
		return this.get<IUser>("/me")
	}

	async refreshToken(token: string, refreshToken: string): Promise<IResponse<{ access_token: string; refresh_token: string }>> {
		return this.post<{ access_token: string; refresh_token: string }>("/refresh_token", {
			access_token: token,
			refresh_token: refreshToken,
		})
	}
}
