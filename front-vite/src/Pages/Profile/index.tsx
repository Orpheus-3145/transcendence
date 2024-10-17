import React from 'react';
import { Avatar, Box, Button, Stack, Typography, useTheme, Divider, Grid, IconButton, Container } from '@mui/material';
import {Input} from '@mui/material'
import { useMediaQuery } from '@mui/material';
import { darken, alpha } from '@mui/material/styles';
import {
    AccountCircle as AccountCircleIcon,
    EmojiEvents as Cup,
    PersonAdd as AddIcon,
    Add as Add,
    Block as BlockIcon,
    VideogameAsset as GameIcon,
    Message as MessageIcon,
    PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { useUser } from '../../Providers/UserContext/User';
import { useLocation } from 'react-router-dom';
import {userServ} from 'UsersService';



const ProfilePage: React.FC = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useUser();
    const location = useLocation();
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1]

    let friendLine = () => {
        return (
            <Stack direction={'row'}
                sx={{
                    cursor: 'pointer',
                    justifyContent: 'space-between',
                    paddingX: '1em',
                    alignItems: 'center',
                }}
            >
                <Stack direction={'row'} 
                    spacing={2} 
                    alignContent='center' 
                    alignItems={'center'} 
                    marginY={theme.spacing(.5)}
                >
                    <AccountCircleIcon />
                    <Typography sx={{ '&:hover': { color: theme.palette.secondary.dark } }}>
                        UserName
                    </Typography>
                </Stack>
                <Stack direction={'row'} 
                    alignContent='center' 
                    alignItems={'center'} 
                    marginY={theme.spacing(.5)}
                >
                    <Grid container gap={1} justifyContent={'center'} alignContent={'center'} flexGrow={1}></Grid>
                    <Grid item>
                        <IconButton 
                            onClick={() => {RemoveFriend}}
                            sx={{
                                color: theme.palette.secondary.light, 
                                cursor: 'pointer', 
                                '&:hover': { 
                                    color: theme.palette.error.dark 
                                },
                            }}
                        >
                            <PersonOffIcon />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton 
                            onClick={() => {BlockFriend}}
                            sx={{color: theme.palette.secondary.light, 
                                cursor: 'pointer', 
                                '&:hover': { 
                                    color: theme.palette.error.dark 
                                },
                            }}
                        >
                            <BlockIcon />
                        </IconButton>
                    </Grid>
                </Stack>
            </Stack>
        );
    };

    let RemoveFriend = () => {
        console.log("User: " + user.nameNick + " wants to remove this person!");
    } //still need to make it work

    let BlockFriend = () => {
        console.log("User: " + user.nameNick + " wants to block this person!");
    } //still need to make it work

    let friendCategory = () => {
        return (
            <Stack
                direction='column'
                bgcolor={theme.palette.primary.main}
                spacing={'0.3em'}
                marginY={'0.3em'}
                sx={{
                    minWidth: '250px',
                    width: '100%',
                    backgroundColor: alpha(theme.palette.background.default, 0.05),
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.background.default, 0.1),
                    },
                    '& > *': {
                        alignItems: 'center',
                        height: '3em',
                        color: theme.palette.secondary.main,
                        borderRadius: '2em',
                        marginY: '0.3em',
                        boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.2)`,
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        transition: 'border-radius 0.2s ease',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.background.default, 0.7),
                            borderRadius: '0',
                        },
                    },
                }}
            >
                {friendLine()}
            </Stack>
        );
    };

    const stats = [
        { title: 'Games Played', value: 8, rate: '75%' },
    ];

    const vanillaStats = [
        { title: 'Vanilla Games', value: 25, rate: '75%' },
    ];

    const customStats = [
        { title: 'Custom Games', value: 100, rate: '75%' },
    ];

    let gameStats = () => {
        return (
            <Box
                sx={{
                    width: '100%',
                    borderBottom: 2,
                    borderColor: 'divider',
                    padding: '0.3em',
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.1)
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    width="100%"
                    gap={2}
                    justifyContent="space-around"
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    {[stats, vanillaStats, customStats].map((group, index) => (
                        <Stack
                            key={index}
                            direction="column"
                            flex={{ xs: '1 1 100%', sm: '1 1 33%' }}
                            justifyContent="center"
                            alignItems="center"
                            padding="0.3em"
                        >
                            {group.map((stat, idx) => (
                                <Stack
                                    key={idx}
                                    gap={1}
                                    direction="row"
                                    textAlign="center"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Stack
                                        direction="column"
                                        textAlign="center"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Typography>{stat.title}</Typography>
                                        <Typography>{stat.value}</Typography>
                                    </Stack>
                                    <Stack
                                        direction="column"
                                        textAlign="center"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Cup sx={{ color: (theme) => theme.palette.secondary.main }} />
                                        <Typography>{stat.rate}</Typography>
                                    </Stack>
                                </Stack>
                            ))}
                        </Stack>
                    ))}
                </Stack>
            </Box>
        );
    };

    let gameLine = () => {
        return (
            <Stack
                direction={'row'}
                gap={1}
                justifyContent={'space-around'}
                alignContent={'center'}
                textAlign={'center'}
                bgcolor={alpha(theme.palette.background.default, 0.3)}
                borderRadius={'2em'}
                padding={'0.3em'}
            >
                <Typography alignContent={'center'} textAlign={'center'}>Type</Typography>
                <Typography alignContent={'center'} textAlign={'center'}>Custom</Typography>
                <Typography alignContent={'center'} textAlign={'center'}>9:15</Typography>
                <Typography alignContent={'center'} textAlign={'center'}>Opponent Name</Typography>
                <Avatar />
            </Stack>
        );
    };

    let gameContainer = () => {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    padding: '0.5em'
                }}
            >
                <Stack gap={1} direction="column" width="100%">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <React.Fragment key={index}>
                            {gameLine()}
                        </React.Fragment>
                    ))}
                </Stack>
            </Box>
        );
    };

    let userInfo = (user:any) => {
        return (
            <Stack
                justifyContent={'space-between'}
                margin={'1em'}
                bgcolor={theme.palette.primary.dark}
            >
                <Stack
                    direction={'row'}
                    padding={'1em'}
                    gap={10}
                    bgcolor={alpha(theme.palette.background.default, 0.5)}
                >
                    <Stack>
                        {GetProfilePic(user)}
                        <Grid container 
                            gap={1} 
                            sx={{
                                position: 'relative',
                                top: '20px',
                                left: '90px',
                                margin: '0 auto',
                            }}
                        >
                            <Grid item>
                                {SetChangePfpButton(user)}
                            </Grid>
                            <Grid item>
                                {GetUserStatus(user)}
                            </Grid>
                        </Grid>
                        <Stack>
                            {GetNickName(user)}
                            {ButtonsProfileGrid(user)}
                            {OtherInfo(user)}
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        );
    };

    let SetChangePfpButton = (user:any) =>
    {
        return (
                <IconButton
                >
                    <EditIcon />
                </IconButton>         
        );
    }

    let OtherInfo = (user:any) =>
    {
        return (
            <Stack
                direction={'column'}
                justifyContent={'center'}
                padding={'1em'}
                sx={{
                    width: '100%',
                    height: '10px',
                    position: 'relative',
                    top: '-300px',
                    left: '700px',   
                }}
            >
                <Typography>
                    <b>Intra name: </b>
                    <br />
                    {user.nameIntra}
                    <br />
                    <br />
                    <b>Email: </b>
                    {user.email}
                    <br />
                </Typography>
            </Stack>
        );
    }

    let ButtonsProfileGrid = (user:any) =>
    {
        return (
            <Stack
                sx={{
                    position: 'relative',
                    left: '250px',
                    top: '-200px',
                }}
            >
                <Grid container gap={1} justifyContent={'center'} alignContent={'center'} flexGrow={1}>
                    <Grid item>
                        <IconButton
                            onClick={() => EditNickName()}
                            sx={{
                                    '&:hover': {
                                        color: '#09af07',
                                    },
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton
                            onClick={() => AddingFriend()}
                            sx={{
                                '&:hover': {
                                    color: theme.palette.primary.light,
                                },
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton
                            onClick={() => InviteToGame()}
                            sx={{
                                '&:hover': {
                                    color: '#BF77F6',
                                },
                            }}
                        >
                            <GameIcon />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton
                            onClick={() => SendMessage()}
                            sx={{
                                '&:hover': {
                                    color: theme.palette.secondary.main,
                                },
                            }}
                        >
                            <MessageIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </Stack>
        );
    }

    let GetNickName = (user:any) => 
    {
        return (
            <Stack
            sx={{
                width: '100%',
                height: '100px',
                position: 'relative',
                left: '300px',
                top: '-200px',
            }}
            >
                <Typography variant={'h3'}>
                    {user.nameNick}
                </Typography>
            </Stack>
        );
    }

    let GetProfilePic = (user:any) =>
    {
        return (
            <Stack
                sx={{
                    position: 'relative',
                    top: '10px',
                    left: '30px',
                }}
            >
                <Avatar
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        width: '100%',
                        height: 'auto',
                        minWidth: '115px',
                        minHeight: '115px',
                        maxHeight: '200px',
                        maxWidth: '200px',
                        bgcolor: theme.palette.success.main,
                    }}
                    src={user.image}
                >
                    <AccountCircleIcon sx={{ width: '100%', height: 'auto' }} />
                </Avatar>
            </Stack>
        );
    }

    const handleKeyDown = (event: React.ChangeEvent<HTMLInputElement>) => {
        const key = event.key;

        if (key == 'Enter')
        {
            if (event.target.value.length > 2)
                setName(event.target.value);
            else
                console.log("Invalid, it needs to contain atleast 3 characters!")
        }
    }

    let setName = (name:string) => {
        console.log("User: " + user.nameNick + " wants to change nickname to: " + name);
    } //still need to make it work

    let EditNickName = () => {
        console.log("User: " + user.nameNick + " wants to edit nickname!");
    } //still need to make it work

    let AddingFriend = () => {
        console.log("User: " + user.nameNick + " wants to add person to friendslist!");
    } //still need to make it work

    let InviteToGame = () => {
        console.log("User: " + user.nameNick + " wants to invite this person to a game!");
    } //still need to make it work

    let SendMessage = () => {
        console.log("User: " + user.nameNick + " wants to send a message to this person!");
    } //still need to make it work

    let GetUserStatus = (user:any) =>
    {
        user.status = 'offline';
        if (user.status == 'offline')
            return (
                <Stack
                >
                    <Box
                    sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#df310e',
                        borderRadius: '50%',
                        position: 'relative',
                    }}
                    >
                    </Box>
                </Stack>
            );
        if (user.status == 'idle')
            return (
                <Stack
                >
                    <Box
                     sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#cfdf0e',
                        borderRadius: '50%',
                        position: 'relative',
                    }}
                     >
                    </Box>
                </Stack>
            );
        else if (user.status == 'online')
            return (
                <Stack
                >
                    <Box
                    sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#0fc00c',
                        borderRadius: '50%',
                        position: 'relative',
                    }}
                    >
                    </Box>
                </Stack>
            );
        else if (user.status == 'ingame')
        {
            return (
                <Stack
                >
                    <Box
                    sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#0dddc4',
                        borderRadius: '50%',
                        position: 'relative',
                    }}
                    >
                    </Box>
                </Stack>
            );
        }
    }

    let friendsBox = () => {
        return (
            <Stack
                gap={1}
                border={1}
                borderColor={theme.palette.divider}
                maxHeight={isSmallScreen ? '80vh' : '80vh'}
            >
                <Box
                    alignContent={'center'}
                    justifyContent={'center'}
                    textAlign={'center'}
                    marginTop={1}
                >
                    <Typography variant="h5" component="h2" align={'center'}>
                        Friends
                    </Typography>
                </Box>
                <Stack
                    divider={<Divider />}
                    gap={1}
                    border={1}
                    borderColor={theme.palette.divider}
                    sx={{
                        height: '100%',
                        overflowY: 'scroll',
                    }}
                >
                    {friendCategory()}
                </Stack>
            </Stack>
        );
    };

    let pageWrapper = () => {
        return (
            <Container sx={{ padding: theme.spacing(3) }}>
                {userInfo(user)}
                <Stack
                    direction={isSmallScreen ? 'column' : 'row'}
                    bgcolor={theme.palette.primary.dark}
                    margin={'1em'}
                    minHeight={'60vh'}
                >
                    {friendsBox()}
                    <Stack
                        width={'100%'}
                        padding={'0.3em'}
                        maxHeight={isSmallScreen ? '80vh' : '80vh'}
                    >
                        {gameStats()}
                        {gameContainer()}
                    </Stack>
                </Stack>
            </Container>
        );
    };

    return (
        pageWrapper()
    );
};

export default ProfilePage;