/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Pressable, Image } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { getOrderDetail, remove } from '../../api/OrderEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import DeleteModal from '../../components/DeleteModal'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const [restaurant, setRestaurant] = useState({})
  const [productToBeDeleted, setProductToBeDeleted] = useState(null)

  // FR6: Show order details. A customer will be able to look his/her orders up. The system should provide all details of an order, including the ordered products and their prices.

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  async function fetchOrderDetail () {
    try {
      const fetchedOrder = await getOrderDetail(route.params.id)
      setOrder(fetchedOrder)
      setRestaurant(fetchedOrder.restaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving your orders. ${error}`,
        type: 'error',
        style: flashStyle,
        textStyle: flashTextStyle
      })
    }
  }

  const renderHeader = (item) => {
    return (
      <View style={styles.restaurantHeaderContainer}>
        <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
        <TextSemiBold textStyle={styles.textTitle}>Order {order.id}</TextSemiBold>
        <TextRegular textStyle={styles.headerText}>Created at: {order.createdAt}</TextRegular>
        {order.startedAt && <TextRegular textStyle={styles.headerText}>Started at: {order.startedAt}</TextRegular>}
        <TextRegular textStyle={styles.headerText}>Total Price: {order.price} €</TextRegular>
        <TextRegular textStyle={styles.headerText}>Address: {order.address}</TextRegular>
        <TextRegular textStyle={styles.headerText}>Shipping costs: {order.shippingCosts} €</TextRegular>
        <TextRegular textStyle={styles.headerText}>Status: {order.status}</TextRegular>
      </View>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular style={styles.emptyList}>
        No products can be shown. Please order some products.
      </TextRegular>
    )
  }

  const removeProduct = async (product) => {
    try {
      await remove(product.id)
      await fetchOrderDetail()
      setProductToBeDeleted(null)
      showMessage({
        message: `Product ${product.name} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setProductToBeDeleted(null)
      showMessage({
        message: `Product ${product.name} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  /*
  function updatePriceQuantity ({ quantity, index, item }) {
    // Updating the quantity
    const auxQuantity = [...quantities]
    auxQuantity[index] = parseInt(quantity)
    setQuantity(auxQuantity)
    // Updating the price
    const precioAux = [...precio]
    precioAux[index] = item.price * quantity
    setPrecio(precioAux)
  }
  */

  const renderProduct = ({ item, index }) => {
    if (order.status === 'pending') {
      return (
        <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
        >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold>Unity price: <TextRegular textStyle={styles.price}>{item.price.toFixed(2)} €</TextRegular></TextSemiBold>
        <TextSemiBold>Quantity: <TextRegular>{item.OrderProducts.quantity}</TextRegular></TextSemiBold>
        <TextSemiBold>Total price: <TextRegular>{item.price.toFixed(2) * item.OrderProducts.quantity} €</TextRegular></TextSemiBold>
        <View style={{ width: 50 }}>
      </View>
      <Pressable
            onPress={() => { setProductToBeDeleted(item) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.actionButton
            ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <TextRegular textStyle={styles.text}>
              Delete
            </TextRegular>
          </View>
        </Pressable>
      </ImageCard>

      )
    } else {
      return (
        <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
        >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold>Unity price: <TextRegular textStyle={styles.price}>{item.price.toFixed(2)} €</TextRegular></TextSemiBold>
        <TextSemiBold>Quantity: <TextRegular>{item.OrderProducts.quantity}</TextRegular></TextSemiBold>
        <TextSemiBold>Total price: <TextRegular>{item.price.toFixed(2) * item.OrderProducts.quantity} €</TextRegular></TextSemiBold>
      </ImageCard>

      )
    }
  }
  return (
    <>
    <FlatList
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyProductsList}
      style={styles.container}
      data={order.products}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
    />
    <DeleteModal
      isVisible={productToBeDeleted !== null}
      onCancel={() => setProductToBeDeleted(null)}
      onConfirm={() => removeProduct(productToBeDeleted)}>
    </DeleteModal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    marginBottom: 5,
    marginTop: 1
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center',
    marginLeft: 5
  },
  headerText: {
    color: 'white',
    textAlign: 'center'
  }
})
