import React from 'react';
import { Avatar, Box, Button, Stack, Typography, useTheme, Divider, Grid, IconButton, Container } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { darken, alpha } from '@mui/material/styles';
import {
    AccountCircle as AccountCircleIcon,
    EmojiEvents as Cup,
    PersonAdd as AddIcon,
    Block as BlockIcon,
    VideogameAsset as GameIcon,
    Message as MessageIcon,
    PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { useUser } from '../../Providers/UserContext/User';
import { useLocation } from 'react-router-dom';



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
                <Stack direction={'row'} spacing={2} alignContent='center' alignItems={'center'} marginY={theme.spacing(.5)}>
                    <AccountCircleIcon />
                    <Typography sx={{ '&:hover': { color: theme.palette.secondary.dark } }}>
                        UserName
                    </Typography>
                </Stack>
                <Stack direction={'row'} spacing={2} alignContent='center' alignItems={'center'} marginY={theme.spacing(.5)}>
                    <Stack onClick={(event) => { event.stopPropagation(); }}
                        sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.error.dark } }}
                    >
                        <PersonOffIcon />
                    </Stack>
                </Stack>
            </Stack>
        );
    };

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
                        marginY: '0.3em',
                        boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.2)`,
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        transition: 'border-radius 0.2s ease, boxShadow 0.2s ease',
                        '&:hover': {
                            boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 1)`,
                            backgroundColor: alpha(theme.palette.background.default, 0.9),
                            borderRadius: '2em',
                        },
                    },
                }}
            >
                {friendLine()}
                {friendLine()}
                {friendLine()}
                {friendLine()}
                {friendLine()}
                {friendLine()}
                {friendLine()}
                {friendLine()}
                {friendLine()}
                {friendLine()}
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
                    {Array.from({ length: 40 }).map((_, index) => (
                        <React.Fragment key={index}>
                            {gameLine()}
                        </React.Fragment>
                    ))}
                </Stack>
            </Box>
        );
    };

    let userInfo = () => {
        return (
            <Stack
                direction={isSmallScreen ? 'column' : 'row'}
                justifyContent={'space-between'}
                margin={'1em'}
                bgcolor={theme.palette.primary.dark}
            >
                <Stack
                    direction={'row'}
                    padding={'1em'}
                    gap={1}
                    bgcolor={alpha(theme.palette.background.default, 0.5)}
                >
                    <Stack
                        gap={1}
                        direction={'column'}
                        justifyContent={'center'}
                        padding={'1em'}
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
                        >
                            <AccountCircleIcon sx={{ width: '100%', height: 'auto' }} />
                        </Avatar>
                        <Stack direction={'column'}
                            sx={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                            }}
                        >
                            <Grid container justifyContent={'center'} alignContent={'center'} flexGrow={1}>
                                <Grid item>
                                    <IconButton
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
                                        sx={{
                                            '&:hover': {
                                                color: theme.palette.error.main,
                                            },
                                        }}
                                    >
                                        <BlockIcon />
                                    </IconButton>
                                </Grid>
                                <Grid item>
                                    <IconButton
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
                    </Stack>
                    <Stack
                        direction={'column'}
                        justifyContent={'center'}
                        gap={1}
                        padding={'1em'}
                    >
                        <Typography style={{ wordBreak: 'break-word' }}>
                            <b>Username</b>
                        </Typography>
                        <Typography style={{ wordBreak: 'break-word' }}>
                            <b>Nickname</b>
                        </Typography>
                        <Typography style={{ wordBreak: 'break-word' }}>
                            <b>Greeting</b>
                        </Typography>
                    </Stack>
                </Stack>
                <Stack
                    justifyContent={'center'}
                    direction={isSmallScreen ? 'row' : 'column'}
                    padding={'1em'}
                    gap={2}
                    bgcolor={alpha(theme.palette.background.default, 0.5)}
                >
                    <Typography>
                        <b>Phone Number:</b>
                        <br />
                        <b>9485498984894948</b>
                    </Typography>
                    <Typography>
                        <b>Email:</b>
                        <br />
                        <b>testeremail@outlook.com</b>
                    </Typography>
                </Stack>
            </Stack>
        );
    };

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
                    {friendCategory()}
                </Stack>
            </Stack>
        );
    };

    let pageWrapper = () => {
        return (
            <Container sx={{ padding: theme.spacing(3) }}>
                {userInfo()}
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