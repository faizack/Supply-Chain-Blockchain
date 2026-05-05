import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('SupplyChain', () => {
  async function deployFixture() {
    const [owner, supplier, producer, distributor, seller, other] = await ethers.getSigners()
    const SupplyChain = await ethers.getContractFactory('SupplyChain')
    const supplyChain = await SupplyChain.deploy()
    await supplyChain.waitForDeployment()

    return { supplyChain, owner, supplier, producer, distributor, seller, other }
  }

  it('sets the deployer as owner', async () => {
    const { supplyChain, owner } = await deployFixture()
    const contractOwner = await supplyChain.owner()
    expect(contractOwner).to.equal(owner.address)
  })

  it('reverts addProduct when roles are not registered', async () => {
    const { supplyChain, producer } = await deployFixture()

    await expect(
      supplyChain.connect(producer).addProduct('Steel coil', 'Batch A'),
    ).to.be.revertedWith('All roles required')
  })

  it('reverts addProduct for owner when owner is not a registered producer', async () => {
    const { supplyChain, owner, supplier, producer, distributor, seller } = await deployFixture()

    await supplyChain.connect(owner).addSupplier(supplier.address, 'Acme Supply', 'City')
    await supplyChain.connect(owner).addProducer(producer.address, 'Fab Inc', 'City')
    await supplyChain.connect(owner).addDistributor(distributor.address, 'LogiCo', 'City')
    await supplyChain.connect(owner).addSeller(seller.address, 'Retail One', 'City')

    await expect(supplyChain.connect(owner).addProduct('Steel coil', 'Batch A')).to.be.revertedWith('Not producer')
  })

  it('allows producer to add a product after registering all roles', async () => {
    const { supplyChain, owner, supplier, producer, distributor, seller } = await deployFixture()

    await supplyChain.connect(owner).addSupplier(supplier.address, 'Acme Supply', 'City')
    await supplyChain.connect(owner).addProducer(producer.address, 'Fab Inc', 'City')
    await supplyChain.connect(owner).addDistributor(distributor.address, 'LogiCo', 'City')
    await supplyChain.connect(owner).addSeller(seller.address, 'Retail One', 'City')

    await expect(
      supplyChain.connect(producer).addProduct('Steel coil', 'Batch A'),
    ).to.not.be.reverted

    const ctr = await supplyChain.productCtr()
    expect(ctr).to.equal(1n)

    const product = await supplyChain.ProductStock(1)
    expect(product.name).to.equal('Steel coil')
    expect(product.description).to.equal('Batch A')
  })

  it('progresses through supply chain stages with the correct roles', async () => {
    const { supplyChain, owner, supplier, producer, distributor, seller } = await deployFixture()

    await supplyChain.connect(owner).addSupplier(supplier.address, 'Acme Supply', 'City')
    await supplyChain.connect(owner).addProducer(producer.address, 'Fab Inc', 'City')
    await supplyChain.connect(owner).addDistributor(distributor.address, 'LogiCo', 'City')
    await supplyChain.connect(owner).addSeller(seller.address, 'Retail One', 'City')
    await supplyChain.connect(producer).addProduct('Steel coil', 'Batch A')

    await supplyChain.connect(supplier).supplyProduct(1)
    await supplyChain.connect(producer).processProduct(1)
    await supplyChain.connect(distributor).distributeProduct(1)
    await supplyChain.connect(seller).listForSale(1)
    await supplyChain.connect(seller).markProductSold(1)

    const stage = await supplyChain.showStage(1)
    expect(stage).to.equal('Product Sold')
  })

  it('reverts when a non-supplier tries to supply a product', async () => {
    const { supplyChain, owner, supplier, producer, distributor, seller, other } = await deployFixture()

    await supplyChain.connect(owner).addSupplier(supplier.address, 'Acme Supply', 'City')
    await supplyChain.connect(owner).addProducer(producer.address, 'Fab Inc', 'City')
    await supplyChain.connect(owner).addDistributor(distributor.address, 'LogiCo', 'City')
    await supplyChain.connect(owner).addSeller(seller.address, 'Retail One', 'City')
    await supplyChain.connect(producer).addProduct('Steel coil', 'Batch A')

    await expect(supplyChain.connect(other).supplyProduct(1)).to.be.reverted
  })
})
