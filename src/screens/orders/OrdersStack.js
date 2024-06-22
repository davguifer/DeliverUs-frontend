import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import OrdersScreen from './OrdersScreen'
import OrderDetailScreen from './OrderDetailScreen'
import EditOrderScreen from './EditOrderScreen'
import ConfirmOrderScreen from '../orders/ConfirmOrderScreen'
import ConfirmOrderScreenYes from '../orders/ConfirmOrderScreenYes'
import ConfirmOrderScreenNo from '../orders/ConfirmOrderScreenNo'

const Stack = createNativeStackNavigator()

export default function OrdersStack () {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='OrdersScreen'
        component={OrdersScreen}
        options={{
          title: 'My Orders'
        }} />
      <Stack.Screen
        name='OrderDetailScreen'
        component={OrderDetailScreen}
        options={{
          title: 'Order Detail'
        }} />
        <Stack.Screen
        name='EditOrderScreen'
        component={EditOrderScreen}
        options={{
          title: 'Edit Order'
        }} />
         <Stack.Screen
        name='ConfirmOrderScreen'
        component={ConfirmOrderScreen}
        options={{
          title: 'Confirm your order'
        }} />
      <Stack.Screen
        name='ConfirmOrderScreenYes'
        component={ConfirmOrderScreenYes}
        options={{
          title: 'Confirm your order'
        }} />
      <Stack.Screen
        name='ConfirmOrderScreenNo'
        component={ConfirmOrderScreenNo}
        options={{
          title: 'Confirm your order'
        }}
        />

    </Stack.Navigator>
  )
}