package routes

import (
	"net/http"

	"emarket-api/databases"
	"emarket-api/middlewares"
	"emarket-api/responses"

	authHandlerPkg "emarket-api/src/auth/handlers"
	authRepoPkg "emarket-api/src/auth/repositories"
	authUsecasePkg "emarket-api/src/auth/usecases"

	stallHandlerPkg "emarket-api/src/stall/handlers"
	stallRepoPkg "emarket-api/src/stall/repositories"
	stallUsecasePkg "emarket-api/src/stall/usecases"

	bookingHandlerPkg "emarket-api/src/booking/handlers"
	bookingRepoPkg "emarket-api/src/booking/repositories"
	bookingUsecasePkg "emarket-api/src/booking/usecases"
	notificationHandlerPkg "emarket-api/src/notification/handlers"

	appHandlerPkg "emarket-api/src/application/handlers"
	appRepoPkg "emarket-api/src/application/repositories"
	appUsecasePkg "emarket-api/src/application/usecases"

	contractHandlerPkg "emarket-api/src/contract/handlers"
	contractRepoPkg "emarket-api/src/contract/repositories"
	contractUsecasePkg "emarket-api/src/contract/usecases"

	marketHandlerPkg "emarket-api/src/market/handlers"
	marketRepoPkg "emarket-api/src/market/repositories"
	marketUsecasePkg "emarket-api/src/market/usecases"

	itemHandlerPkg "emarket-api/src/item/handlers"
	itemRepoPkg "emarket-api/src/item/repositories"
	itemUsecasePkg "emarket-api/src/item/usecases"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.New()

	r.Use(middlewares.Cors())
	r.Use(middlewares.Recovery())
	r.Use(middlewares.LogRequest())
	r.Use(func(c *gin.Context) {
		c.Header("Cache-Control", "private, no-store, max-age=0")
		c.Header("Pragma", "no-cache")
		c.Next()
	})

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, responses.SuccessResponse(gin.H{
			"status":  "healthy",
			"service": "emarket-api",
		}, http.StatusOK))
	})

	// Dependency Injections
	db := databases.DB

	authRepo := authRepoPkg.NewRepository(db)
	authUC := authUsecasePkg.NewUseCase(authRepo)
	authHandler := authHandlerPkg.NewHandler(authUC)

	stallRepo := stallRepoPkg.NewRepository(db)
	stallUC := stallUsecasePkg.NewUseCase(stallRepo)
	stallHandler := stallHandlerPkg.NewHandler(stallUC)

	bookingRepo := bookingRepoPkg.NewRepository(db)
	bookingUC := bookingUsecasePkg.NewUseCase(bookingRepo)
	bookingHandler := bookingHandlerPkg.NewHandler(bookingUC)
	notificationHandler := notificationHandlerPkg.NewHandler(db)

	appRepo := appRepoPkg.NewRepository(db)
	appUC := appUsecasePkg.NewUseCase(appRepo)
	appHandler := appHandlerPkg.NewHandler(appUC)

	contractRepo := contractRepoPkg.NewRepository(db)
	contractUC := contractUsecasePkg.NewUseCase(contractRepo)
	contractHandler := contractHandlerPkg.NewHandler(contractUC)

	marketRepo := marketRepoPkg.NewRepository(db)
	marketUC := marketUsecasePkg.NewUseCase(marketRepo)
	marketHandler := marketHandlerPkg.NewHandler(marketUC)

	itemRepo := itemRepoPkg.NewRepository(db)
	itemUC := itemUsecasePkg.NewUseCase(itemRepo)
	itemHandler := itemHandlerPkg.NewHandler(itemUC)

	// API Groups
	api := r.Group("/api/v1")
	{
		// Auth Routes
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/login", authHandler.Login)
			authGroup.GET("/me", middlewares.AuthorizeJWT(), authHandler.GetProfile)
			authGroup.POST("/switch-role", authHandler.SwitchRole)
			authGroup.POST("/refresh_token", authHandler.RefreshToken)
		}

		// Market Routes
		marketGroup := api.Group("/markets")
		{
			marketGroup.GET("", marketHandler.GetMarkets)
			marketGroup.GET("/:id", marketHandler.GetMarketByID)
			marketGroup.GET("/:id/zones", marketHandler.GetMarketZones)
		}

		// Stall Routes
		stallGroup := api.Group("/stalls")
		{
			stallGroup.GET("", stallHandler.GetStalls)
			stallGroup.GET("/:id", stallHandler.GetStallByID)
			stallGroup.POST("", middlewares.AuthorizeJWT(), middlewares.RequireRoles("admin", "staff"), stallHandler.CreateStall)
		}

		// Booking Routes
		bookingGroup := api.Group("/bookings", middlewares.AuthorizeJWT())
		{
			bookingGroup.GET("", bookingHandler.GetBookings)
			bookingGroup.GET("/visit-capacity", bookingHandler.GetVisitCapacity)
			// This endpoint returns only masked queue data, so a signed-in tenant can
			// determine their real queue position without exposing another tenant's PII.
			bookingGroup.GET("/waiting-queue/:ident", stallHandler.GetWaitingQueue)
			bookingGroup.GET("/stall-queue/:ident", stallHandler.GetWaitingQueue)
			bookingGroup.GET("/:id", bookingHandler.GetBookingByID)
			bookingGroup.POST("", bookingHandler.CreateBooking)
			bookingGroup.POST("/clear", bookingHandler.ClearAll)
			bookingGroup.POST("/:id/approve", bookingHandler.Approve)
			bookingGroup.POST("/:id/reject", bookingHandler.Reject)
			bookingGroup.POST("/:id/mark-visited", bookingHandler.MarkVisited)
			bookingGroup.POST("/:id/visited", bookingHandler.MarkVisited)
			bookingGroup.POST("/:id/no-show", bookingHandler.NoShow)
			bookingGroup.POST("/:id/noshow", bookingHandler.NoShow)
			bookingGroup.POST("/:id/decide", bookingHandler.Decide)
			bookingGroup.POST("/:id/officer-record-proxy", bookingHandler.OfficerRecordProxy)
			bookingGroup.POST("/:id/cancel", bookingHandler.Cancel)
			bookingGroup.POST("/:id/select-slot", bookingHandler.SelectSlot)
			bookingGroup.PATCH("/:id/status", middlewares.RequireRoles("admin", "staff"), bookingHandler.UpdateBookingStatus)
		}

		notificationGroup := api.Group("/notifications", middlewares.AuthorizeJWT())
		{
			notificationGroup.GET("", notificationHandler.GetNotifications)
			notificationGroup.POST("/read-all", notificationHandler.MarkAllRead)
			notificationGroup.POST("/:id/read", notificationHandler.MarkRead)
		}

		// Application Routes
		appGroup := api.Group("/applications")
		{
			appGroup.GET("", appHandler.GetApplications)
			appGroup.GET("/:id", appHandler.GetApplicationByID)
			appGroup.POST("", appHandler.CreateApplication)
			appGroup.PATCH("/:id/status", middlewares.AuthorizeJWT(), middlewares.RequireRoles("admin", "staff"), appHandler.UpdateApplicationStatus)
		}

		// Contract Routes
		contractGroup := api.Group("/contracts")
		{
			contractGroup.GET("", contractHandler.GetContracts)
			contractGroup.GET("/:id", contractHandler.GetContractByID)
			contractGroup.POST("", middlewares.AuthorizeJWT(), middlewares.RequireRoles("admin", "staff"), contractHandler.CreateContract)
		}

		// Item Routes (Blueprint demonstration module)
		itemGroup := api.Group("/items")
		{
			itemGroup.GET("/datatable", itemHandler.GetItems)
			itemGroup.GET("/:id", itemHandler.GetItemByID)
			itemGroup.POST("", middlewares.AuthorizeJWT(), itemHandler.CreateItem)
			itemGroup.PUT("/:id", middlewares.AuthorizeJWT(), itemHandler.UpdateItem)
			itemGroup.DELETE("/:id", middlewares.AuthorizeJWT(), itemHandler.DeleteItem)
		}
	}

	return r
}
