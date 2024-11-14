import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from '@mui/material/';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { getAll, User } from '../../Providers/UserContext/User';

const AllUsersPage: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const navigate = useNavigate();
	
	useEffect(() => {
		const fetchUsers = async () => {
			const usersList = await getAll();
			setUsers(usersList);
		};
		fetchUsers();
	}, []);

	let redirectToUser = (id: number) => {
		navigate(`/profile/${id}`);
	}
 
	return (
		<ImageList cols={3}>
			{users.map((item: User) => (
				<ImageListItem key={item.image}>
					<img
						src={item.image}
						alt={item.nameNick}
						loading="lazy"
					/>
					<Link href="" 
					onClick={() => redirectToUser(item.id)} 
					sx={{ 
						color: 'orange'
					 }}>
					{item.nameNick}
  					</Link>
				</ImageListItem>
			))}
		</ImageList>
	);
};

export default AllUsersPage;
