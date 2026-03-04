import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('SupplyChain', () => {
  async function deployFixture() {
    const [owner, rms, man, dis, ret, other] = await ethers.getSigners()
    const SupplyChain = await ethers.getContractFactory('SupplyChain')
    const supplyChain = await SupplyChain.deploy()
    await supplyChain.waitForDeployment()

    return { supplyChain, owner, rms, man, dis, ret, other }
  }

  it('sets the deployer as Owner', async () => {
    const { supplyChain, owner } = await deployFixture()
    const contractOwner = await supplyChain.Owner()
    expect(contractOwner).to.equal(owner.address)
  })

  it('reverts addMedicine if roles are not registered', async () => {
    const { supplyChain, owner } = await deployFixture()

    await expect(
      supplyChain.connect(owner).addMedicine('Test Medicine', 'Description'),
    ).to.be.reverted
  })

  it('allows owner to add medicine after registering all roles', async () => {
    const { supplyChain, owner, rms, man, dis, ret } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')

    await expect(
      supplyChain
        .connect(owner)
        .addMedicine('Test Medicine', 'Description'),
    ).to.not.be.reverted

    const medicineCtr = await supplyChain.medicineCtr()
    expect(medicineCtr).to.equal(1n)

    const medicine = await supplyChain.MedicineStock(1)
    expect(medicine.name).to.equal('Test Medicine')
    expect(medicine.description).to.equal('Description')
  })

  it('progresses through supply chain stages with correct roles', async () => {
    const { supplyChain, owner, rms, man, dis, ret } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')
    await supplyChain
      .connect(owner)
      .addMedicine('Test Medicine', 'Description')

    await supplyChain.connect(rms).RMSsupply(1)
    await supplyChain.connect(man).Manufacturing(1)
    await supplyChain.connect(dis).Distribute(1)
    await supplyChain.connect(ret).Retail(1)
    await supplyChain.connect(ret).sold(1)

    const stage = await supplyChain.showStage(1)
    expect(stage).to.equal('Medicine Sold')
  })

  it('reverts when wrong role tries to progress medicine', async () => {
    const { supplyChain, owner, rms, man, dis, ret, other } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')
    await supplyChain
      .connect(owner)
      .addMedicine('Test Medicine', 'Description')

    await expect(
      supplyChain.connect(other).RMSsupply(1),
    ).to.be.reverted
  })
})

import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('SupplyChain', () => {
  async function deployFixture() {
    const [owner, rms, man, dis, ret, other] = await ethers.getSigners()
    const SupplyChain = await ethers.getContractFactory('SupplyChain')
    const supplyChain = await SupplyChain.deploy()
    await supplyChain.waitForDeployment()

    return { supplyChain, owner, rms, man, dis, ret, other }
  }

  it('sets the deployer as Owner', async () => {
    const { supplyChain, owner } = await deployFixture()
    const contractOwner = await supplyChain.Owner()
    expect(contractOwner).to.equal(owner.address)
  })

  it('reverts addMedicine if roles are not registered', async () => {
    const { supplyChain, owner } = await deployFixture()

    await expect(
      supplyChain.connect(owner).addMedicine('Test Medicine', 'Description'),
    ).to.be.reverted
  })

  it('allows owner to add medicine after registering all roles', async () => {
    const { supplyChain, owner, rms, man, dis, ret } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')

    await expect(
      supplyChain
        .connect(owner)
        .addMedicine('Test Medicine', 'Description'),
    ).to.not.be.reverted

    const medicineCtr = await supplyChain.medicineCtr()
    expect(medicineCtr).to.equal(1n)

    const medicine = await supplyChain.MedicineStock(1)
    expect(medicine.name).to.equal('Test Medicine')
    expect(medicine.description).to.equal('Description')
  })

  it('progresses through supply chain stages with correct roles', async () => {
    const { supplyChain, owner, rms, man, dis, ret } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')
    await supplyChain
      .connect(owner)
      .addMedicine('Test Medicine', 'Description')

    await supplyChain.connect(rms).RMSsupply(1)
    await supplyChain.connect(man).Manufacturing(1)
    await supplyChain.connect(dis).Distribute(1)
    await supplyChain.connect(ret).Retail(1)
    await supplyChain.connect(ret).sold(1)

    const stage = await supplyChain.showStage(1)
    expect(stage).to.equal('Medicine Sold')
  })

  it('reverts when wrong role tries to progress medicine', async () => {
    const { supplyChain, owner, rms, man, dis, ret, other } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')
    await supplyChain
      .connect(owner)
      .addMedicine('Test Medicine', 'Description')

    await expect(
      supplyChain.connect(other).RMSsupply(1),
    ).to.be.reverted
  })
})

import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('SupplyChain', () => {
  async function deployFixture() {
    const [owner, rms, man, dis, ret, other] = await ethers.getSigners()
    const SupplyChain = await ethers.getContractFactory('SupplyChain')
    const supplyChain = await SupplyChain.deploy()
    await supplyChain.waitForDeployment()

    return { supplyChain, owner, rms, man, dis, ret, other }
  }

  it('sets the deployer as Owner', async () => {
    const { supplyChain, owner } = await deployFixture()
    const contractOwner = await supplyChain.Owner()
    expect(contractOwner).to.equal(owner.address)
  })

  it('reverts addMedicine if roles are not registered', async () => {
    const { supplyChain, owner } = await deployFixture()

    await expect(
      supplyChain.connect(owner).addMedicine('Test Medicine', 'Description'),
    ).to.be.reverted
  })

  it('allows owner to add medicine after registering all roles', async () => {
    const { supplyChain, owner, rms, man, dis, ret } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')

    await expect(
      supplyChain
        .connect(owner)
        .addMedicine('Test Medicine', 'Description'),
    ).to.not.be.reverted

    const medicineCtr = await supplyChain.medicineCtr()
    expect(medicineCtr).to.equal(1n)

    const medicine = await supplyChain.MedicineStock(1)
    expect(medicine.name).to.equal('Test Medicine')
    expect(medicine.description).to.equal('Description')
  })

  it('progresses through supply chain stages with correct roles', async () => {
    const { supplyChain, owner, rms, man, dis, ret } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')
    await supplyChain
      .connect(owner)
      .addMedicine('Test Medicine', 'Description')

    await supplyChain.connect(rms).RMSsupply(1)
    await supplyChain.connect(man).Manufacturing(1)
    await supplyChain.connect(dis).Distribute(1)
    await supplyChain.connect(ret).Retail(1)
    await supplyChain.connect(ret).sold(1)

    const stage = await supplyChain.showStage(1)
    expect(stage).to.equal('Medicine Sold')
  })

  it('reverts when wrong role tries to progress medicine', async () => {
    const { supplyChain, owner, rms, man, dis, ret, other } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')
    await supplyChain
      .connect(owner)
      .addMedicine('Test Medicine', 'Description')

    await expect(
      supplyChain.connect(other).RMSsupply(1),
    ).to.be.reverted
  })
})

import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('SupplyChain', () => {
  async function deployFixture() {
    const [owner, rms, man, dis, ret, other] = await ethers.getSigners()
    const SupplyChain = await ethers.getContractFactory('SupplyChain')
    const supplyChain = await SupplyChain.deploy()
    await supplyChain.waitForDeployment()

    return { supplyChain, owner, rms, man, dis, ret, other }
  }

  it('sets the deployer as Owner', async () => {
    const { supplyChain, owner } = await deployFixture()
    const contractOwner = await supplyChain.Owner()
    expect(contractOwner).to.equal(owner.address)
  })

  it('reverts addMedicine if roles are not registered', async () => {
    const { supplyChain } = await deployFixture()

    await expect(
      supplyChain.addMedicine('Test Medicine', 'Description'),
    ).to.be.revertedWithCustomError
  })

  it('allows owner to add medicine after registering all roles', async () => {
    const { supplyChain, owner, rms, man, dis, ret } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')

    await expect(
      supplyChain
        .connect(owner)
        .addMedicine('Test Medicine', 'Description'),
    ).to.not.be.reverted

    const medicineCtr = await supplyChain.medicineCtr()
    expect(medicineCtr).to.equal(1n)

    const medicine = await supplyChain.MedicineStock(1)
    expect(medicine.name).to.equal('Test Medicine')
    expect(medicine.description).to.equal('Description')
  })

  it('progresses through supply chain stages with correct roles', async () => {
    const { supplyChain, owner, rms, man, dis, ret } = await deployFixture()

    await supplyChain
      .connect(owner)
      .addRMS(rms.address, 'RMS', 'City')
    await supplyChain
      .connect(owner)
      .addManufacturer(man.address, 'MAN', 'City')
    await supplyChain
      .connect(owner)
      .addDistributor(dis.address, 'DIS', 'City')
    await supplyChain
      .connect(owner)
      .addRetailer(ret.address, 'RET', 'City')
  })
})
