import React from 'react';
import ReactDOM from 'react-dom/client';
import MainAppComponent from './MainAppComponent';
import { UserProvider } from './Providers/UserContext/User';
import { BrowserRouter } from 'react-router-dom';
import { GameDataProvider } from '/app/src/Providers/GameContext/Game';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<UserProvider>
				<GameDataProvider>
					<MainAppComponent />
				</GameDataProvider>
			</UserProvider>
		</BrowserRouter>
	</React.StrictMode>,
);
