// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    enum ROLE {
        NONE,
        SUPPLIER,
        PRODUCER,
        DISTRIBUTOR,
        SELLER
    }

    enum STAGE {
        Created,
        Processing,
        InTransit,
        ForSale,
        Sold
    }

    uint256 public productCtr = 0;
    uint256 public supplierCtr = 0;
    uint256 public producerCtr = 0;
    uint256 public distributorCtr = 0;
    uint256 public sellerCtr = 0;

    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 supplierId;
        uint256 producerId;
        uint256 distributorId;
        uint256 sellerId;
        STAGE stage;
    }

    struct Actor {
        address addr;
        uint256 id;
        string name;
        string place;
        ROLE role;
    }

    mapping(uint256 => Product) public ProductStock;
    mapping(uint256 => Actor) public SUPPLIERS;
    mapping(uint256 => Actor) public PRODUCERS;
    mapping(uint256 => Actor) public DISTRIBUTORS;
    mapping(uint256 => Actor) public SELLERS;

    event ActorAdded(uint256 indexed actorId, ROLE indexed role, address indexed actor, string name, string place);
    event ProductAdded(uint256 indexed productId, string name);
    event ProductStageUpdated(uint256 indexed productId, STAGE indexed stage);

    function addActor(
        address _address,
        string memory _name,
        string memory _place,
        ROLE _role
    ) public onlyOwner {
        require(_address != address(0), "Invalid address");
        require(_role != ROLE.NONE, "Invalid role");

        if (_role == ROLE.SUPPLIER) {
            supplierCtr++;
            SUPPLIERS[supplierCtr] = Actor(_address, supplierCtr, _name, _place, _role);
            emit ActorAdded(supplierCtr, _role, _address, _name, _place);
        } else if (_role == ROLE.PRODUCER) {
            producerCtr++;
            PRODUCERS[producerCtr] = Actor(_address, producerCtr, _name, _place, _role);
            emit ActorAdded(producerCtr, _role, _address, _name, _place);
        } else if (_role == ROLE.DISTRIBUTOR) {
            distributorCtr++;
            DISTRIBUTORS[distributorCtr] = Actor(_address, distributorCtr, _name, _place, _role);
            emit ActorAdded(distributorCtr, _role, _address, _name, _place);
        } else if (_role == ROLE.SELLER) {
            sellerCtr++;
            SELLERS[sellerCtr] = Actor(_address, sellerCtr, _name, _place, _role);
            emit ActorAdded(sellerCtr, _role, _address, _name, _place);
        }
    }

    function addSupplier(address _address, string memory _name, string memory _place) public onlyOwner {
        addActor(_address, _name, _place, ROLE.SUPPLIER);
    }

    function addProducer(address _address, string memory _name, string memory _place) public onlyOwner {
        addActor(_address, _name, _place, ROLE.PRODUCER);
    }

    function addDistributor(address _address, string memory _name, string memory _place) public onlyOwner {
        addActor(_address, _name, _place, ROLE.DISTRIBUTOR);
    }

    function addSeller(address _address, string memory _name, string memory _place) public onlyOwner {
        addActor(_address, _name, _place, ROLE.SELLER);
    }

    function addProduct(string memory _name, string memory _description) public {
        require(supplierCtr > 0 && producerCtr > 0 && distributorCtr > 0 && sellerCtr > 0, "All roles required");
        uint256 _producerId = findProducer(msg.sender);
        require(_producerId > 0, "Not producer");
        productCtr++;
        ProductStock[productCtr] = Product(
            productCtr,
            _name,
            _description,
            0,
            0,
            0,
            0,
            STAGE.Created
        );
        emit ProductAdded(productCtr, _name);
    }

    function supplyProduct(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product id");
        uint256 _id = findSupplier(msg.sender);
        require(_id > 0, "Not supplier");
        require(ProductStock[_productId].stage == STAGE.Created, "Wrong stage");
        ProductStock[_productId].supplierId = _id;
        ProductStock[_productId].stage = STAGE.Processing;
        emit ProductStageUpdated(_productId, STAGE.Processing);
    }

    function processProduct(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product id");
        uint256 _id = findProducer(msg.sender);
        require(_id > 0, "Not producer");
        require(ProductStock[_productId].stage == STAGE.Processing, "Wrong stage");
        ProductStock[_productId].producerId = _id;
        ProductStock[_productId].stage = STAGE.InTransit;
        emit ProductStageUpdated(_productId, STAGE.InTransit);
    }

    function distributeProduct(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product id");
        uint256 _id = findDistributor(msg.sender);
        require(_id > 0, "Not distributor");
        require(ProductStock[_productId].stage == STAGE.InTransit, "Wrong stage");
        ProductStock[_productId].distributorId = _id;
        ProductStock[_productId].stage = STAGE.ForSale;
        emit ProductStageUpdated(_productId, STAGE.ForSale);
    }

    function listForSale(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product id");
        uint256 _id = findSeller(msg.sender);
        require(_id > 0, "Not seller");
        require(ProductStock[_productId].stage == STAGE.ForSale, "Wrong stage");
        ProductStock[_productId].sellerId = _id;
        emit ProductStageUpdated(_productId, STAGE.ForSale);
    }

    function markProductSold(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product id");
        uint256 _id = findSeller(msg.sender);
        require(_id > 0, "Not seller");
        require(_id == ProductStock[_productId].sellerId, "Wrong seller");
        require(ProductStock[_productId].stage == STAGE.ForSale, "Wrong stage");
        ProductStock[_productId].stage = STAGE.Sold;
        emit ProductStageUpdated(_productId, STAGE.Sold);
    }

    function showStage(uint256 _productId) public view returns (string memory) {
        require(productCtr > 0, "No products");
        STAGE stage = ProductStock[_productId].stage;
        if (stage == STAGE.Created) return "Product Created";
        if (stage == STAGE.Processing) return "Processing Stage";
        if (stage == STAGE.InTransit) return "In Transit Stage";
        if (stage == STAGE.ForSale) return "For Sale Stage";
        return "Product Sold";
    }

    function findSupplier(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= supplierCtr; i++) {
            if (SUPPLIERS[i].addr == _address) return SUPPLIERS[i].id;
        }
        return 0;
    }

    function findProducer(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= producerCtr; i++) {
            if (PRODUCERS[i].addr == _address) return PRODUCERS[i].id;
        }
        return 0;
    }

    function findDistributor(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= distributorCtr; i++) {
            if (DISTRIBUTORS[i].addr == _address) return DISTRIBUTORS[i].id;
        }
        return 0;
    }

    function findSeller(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= sellerCtr; i++) {
            if (SELLERS[i].addr == _address) return SELLERS[i].id;
        }
        return 0;
    }

}
