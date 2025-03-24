import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import {
    ListItemButton,
    Drawer as MuiDrawer,
    darken,
    Box
} from '@mui/material'

export const StyledIconWrapper = styled('div')(({ theme }) => ({
    boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.05)`,
    color: theme.palette.secondary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-radius 0.3s ease',
    '&:hover': {
        boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.3)`,
        borderRadius: '2em',
    },
}));

export const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.05)`,
    backgroundColor: alpha(theme.palette.background.default, 0.5),
    color: theme.palette.secondary.main,
    transition: 'border-radius 0.2s ease',
    marginTop: theme.spacing(0.5),
    '&:hover': {
        boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.1)`,
        backgroundColor: alpha(theme.palette.background.default, 0.9),
        borderRadius: '2em',
    },
}));

export const DrawerContainer = styled(Box)(({ theme }) => ({
    width: 250,
    backgroundColor: alpha(theme.palette.background.default, 0.05),
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.default, 0.1),
    },
    height: '100%',
}));

// export const NotificationsContainer = styled(Box)(({ theme }) => ({
//     width: 250,
//     backgroundColor: alpha(theme.palette.background.default, 0.05),
//     '&:hover': {
//         backgroundColor: alpha(theme.palette.background.default, 0.1),
//     },
//     height: '100%',
// }));

export const Drawer = styled(MuiDrawer)(({ theme }) => ({
    '& .MuiPaper-root': {
        backgroundColor: darken(theme.palette.background.default, 0.3),
    },
}));