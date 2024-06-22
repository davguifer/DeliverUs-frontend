import React, { useEffect, useContext, useState } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemibold from '../../components/TextSemibold'
import { brandPrimary, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import { getMyOrders, remove } from '../../api/OrderEndpoints'
import { FlatList, ScrollView } from 'react-native-web'
import ImageCard from '../../components/ImageCard'
import * as GlobalStyles from '../../styles/GlobalStyles'
import DeleteModal from '../../components/DeleteModal'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Formik } from 'formik'

export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  const [ordersToBeDeleted, setOrdersToBeDeleted] = useState(null)

  // FR5: Listing my confirmed orders. A Customer will be able to check his/her confirmed orders, sorted from the most recent to the oldest.

  const ordersConfirmed = []
  const ordersPending = []

  async function fetchOrders () {
    try {
      const fetchedOrders = await getMyOrders()
      for (let i = 0; i <= fetchedOrders.length; i++) {
        const order = fetchedOrders[i]
        if (order.startedAt != null) {
          ordersConfirmed.push(order)
        } else {
          ordersPending.push(order)
        }
      }
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving the orders. ${error}`,
        type: 'error',
        style: flashStyle,
        textStyle: flashTextStyle
      })
    }
  }

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser])

  const removeOrder = async (order) => {
    try {
      await remove(order.id)
      await fetchOrders()
      setOrdersToBeDeleted(null)
      showMessage({
        message: `Order ${order.name} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrdersToBeDeleted(null)
      showMessage({
        message: `Order ${order.name} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const renderOrders = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : undefined}
         onPress={() => {
           navigation.navigate('OrderDetailScreen', { id: item.id, dirty: true })
         }}
        // onPress={() => navigation.navigate('EditOrderScreen', { id: item.id })}
      >
      <View style={{ marginLeft: 10 }}>
        <TextSemibold textStyle={{ fontSize: 16, color: 'black' }}>Order {item.id}</TextSemibold>
        <TextSemibold>Created at: <TextRegular numberOfLines={2}>{item.createdAt}</TextRegular></TextSemibold>
        <TextSemibold>Price: <TextRegular style={{ color: brandPrimary }}>{item.price.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Shipping: <TextRegular style={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemibold>
      </View>
      </ImageCard>
    )
  }
  const renderOrdersPending = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : undefined}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id, dirty: true })
        }}
      >
        <View style={{ marginLeft: 10 }}>
          <TextSemibold textStyle={{ fontSize: 16, color: 'black' }}>Order {item.id}</TextSemibold>
          <TextSemibold>Created at: <TextRegular numberOfLines={2}>{item.createdAt}</TextRegular></TextSemibold>
          <TextSemibold>Price: <TextRegular style={{ color: brandPrimary }}>{item.price.toFixed(2)} €</TextRegular></TextSemibold>
          <TextSemibold>Shipping: <TextRegular style={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemibold>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: 10, marginTop: 10 }}>
          <Pressable
            onPress={() => { setOrdersToBeDeleted(item) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? GlobalStyles.brandPrimaryTap : GlobalStyles.brandPrimary,
                borderRadius: 4,
                height: 25,
                width: '20%'
              }
            ]}
          >
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='delete' color={'white'} size={15} style={styles.iconLeft} />
            <TextRegular textStyle={styles.text}>
              Delete
            </TextRegular>
          </View>
          </Pressable>

          <Pressable
            onPress={() => { navigation.navigate('EditOrderScreen', { restaurantId: item.restaurantId }) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? GlobalStyles.brandBlue : GlobalStyles.brandBlue,
                borderRadius: 4,
                height: 25,
                width: '20%'
              }
            ]}
          >
           <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='pencil' color={'white'} size={15} style={styles.iconLeft}/>
            <TextRegular textStyle={styles.text}>
              Edit
            </TextRegular>
          </View>
          </Pressable>
        </View>
      </ImageCard>
    )
  }

  const renderEmptyOrder = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retreived. Are you logged in?
      </TextRegular>
    )
  }

  return (
    <ScrollView>

    <View style={styles.container}>
    <View style={[{ flexDirection: 'row', justifyContent: 'center', margin: 40 }]}>
        <TextRegular style={{ fontSize: 27, color: 'black', fontFamily: 'Montserrat_600SemiBold' }}>
        PEDIDOS CONFIRMADOS:
      </TextRegular>
      </View>
      <FlatList
        style={styles.container}
        data={ordersConfirmed}
        renderItem={renderOrders}
        ListEmptyComponent={renderEmptyOrder}
        keyExtractor={item => item.id.toString()}
        />
        <View style={[{ flexDirection: 'row', justifyContent: 'center' }]}>
        <TextRegular style={{ fontSize: 27, color: 'black', fontFamily: 'Montserrat_600SemiBold' }}>
        PEDIDOS PENDIENTES:
      </TextRegular>
      </View>
      <FlatList
        style={styles.container}
        data={ordersPending}
        renderItem={renderOrdersPending}
        ListEmptyComponent={renderEmptyOrder}
        keyExtractor={item => item.id.toString()}
        />
        <DeleteModal
      isVisible={ordersToBeDeleted !== null}
      onCancel={() => setOrdersToBeDeleted(null)}
      onConfirm={() => removeOrder(ordersToBeDeleted)}>
    </DeleteModal>
    </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 4,
    height: 40,
    margin: 5,
    padding: 1,
    width: '25%'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center'
  },
  textTitle: {
    fontSize: 20,
    color: 'black'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  iconLeft: {
    margin: 5,
    flexDirection: 'row'
  }
})
