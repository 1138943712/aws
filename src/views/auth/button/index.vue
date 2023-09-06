<template>
  <div class="card content-box">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>公钥设置</span>
        </div>
      </template>
      <el-descriptions :column="4">
        <el-descriptions-item label="IDO状态">
          {{ privateInfo.IDOStatus ? "是" : "否" }}
          <el-button @click="handleIDOStatus" type="primary">
            {{ privateInfo.IDOStatus ? "关闭" : "开启" }}
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="minETH">
          {{ privateInfo.minETH }}
          <el-button @click="handleMinEth" type="primary">设置</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="maxETH">
          {{ privateInfo.maxETH }}
          <el-button @click="handleMaxEth" type="primary">设置</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="1ETH换多少token">
          {{ privateInfo.exchangeRate }}
          <el-button @click="handleExchangeRate" type="primary">设置</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="是否开启认领">
          {{ privateInfo.isClaim ? "是" : "否" }}
          <el-button @click="handleIsClaim" type="primary">
            {{ privateInfo.isClaim ? "关闭" : "开启" }}
          </el-button>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions column="4">
        <el-descriptions-item label="总量">
          {{ privateInfo.baseSetting[0] }}
        </el-descriptions-item>
        <el-descriptions-item label="比例">
          {{ privateInfo.baseSetting[1] }}
        </el-descriptions-item>
        <el-descriptions-item label="百分号">
          {{ privateInfo.baseSetting[2] }}
        </el-descriptions-item>
        <el-descriptions-item label="Hard cap">
          {{ privateInfo.baseSetting[3] }}
        </el-descriptions-item>
        <el-descriptions-item label="操作">
          <el-button @click="handleOpenSetting" type="primary">设置</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-dialog :title="title" v-model="minEthDialogVisible" width="30%">
      <el-form :model="minEthForm" :rules="minEthRules" ref="minEthFormRef" label-width="100px">
        <el-form-item label="最小的eth" prop="minEth">
          <el-input v-model="minEthForm.minEth" placeholder="请输入值"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="minEthDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleMinEthSubmit" :loading="btnLoading">确 定</el-button>
      </template>
    </el-dialog>
    <el-dialog title="基础设置" v-model="settingVisible" width="30%">
      <el-form :model="settingForm" :rules="settingFormRules" ref="settingFormRef" label-width="100px">
        <el-form-item label="总量" prop="total">
          <el-input v-model="settingForm.total" placeholder="请输入值"></el-input>
        </el-form-item>
        <el-form-item label="比例" prop="rate">
          <el-input v-model="settingForm.rate" placeholder="请输入值"></el-input>
        </el-form-item>
        <el-form-item label="百分比" prop="per">
          <el-input v-model="settingForm.per" placeholder="请输入值"></el-input>
        </el-form-item>
        <el-form-item label="Hard cap" prop="hard">
          <el-input v-model="settingForm.hard" placeholder="请输入值"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="settingVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSetting" :loading="btnSettingLoading">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="authMenu">
import { ref, onMounted, reactive } from "vue";
import abi from "@/assets/publicAbi.json";
import { ethers } from "ethers";

const minEthFormRef = ref(null);
import { ElMessageBox } from "element-plus";

const privateInfo = ref({
  minETH: 1,
  maxETH: 1,
  exchangeRate: 1,
  accounts: "",
  isClaim: false,
  IDOStatus: false,
  baseSetting: []
});
const minEthDialogVisible = ref(false);
const title = ref("最小的eth");
const settingVisible = ref(false);
const settingFormRef = ref(null);
const settingForm = ref({
  total: null,
  rate: null,
  per: null,
  hard: null
});
const btnSettingLoading = ref(false);

const settingFormRules = ref({
  total: [
    { required: true, message: "请输入", trigger: "blur" },
    // 为数字
    {
      //正则
      pattern: /^-?\d+(,\d{3})*(\.\d{1,2})?$/,
      message: "请输入数字",
      trigger: "blur"
    }
  ],
  rate: [
    { required: true, message: "请输入", trigger: "blur" },
    // 为数字
    {
      //正则
      pattern: /^-?\d+(,\d{3})*(\.\d{1,2})?$/,
      message: "请输入数字",
      trigger: "blur"
    }
  ],
  per: [
    { required: true, message: "请输入", trigger: "blur" },
    // 为数字
    {
      //正则
      pattern: /^-?\d+(,\d{3})*(\.\d{1,2})?$/,
      message: "请输入数字",
      trigger: "blur"
    }
  ],
  hard: [
    { required: true, message: "请输入", trigger: "blur" },
    // 为数字
    {
      //正则
      pattern: /^-?\d+(,\d{3})*(\.\d{1,2})?$/,
      message: "请输入数字",
      trigger: "blur"
    }
  ]
});

const handleOpenSetting = () => {
  settingVisible.value = true;
  btnSettingLoading.value = false;
  settingFormRef.value?.resetFields();
};

const handleSetting = async () => {
  settingFormRef.value.validate(async valid => {
    if (!valid) return;
    btnSettingLoading.value = true;
    const params = [settingForm.value.total, settingForm.value.rate, settingForm.value.per, settingForm.value.hard];
    console.log("settingForm", settingForm);
    const res = await contract.setNumbers(params);
    btnSettingLoading.value = true;
    res.wait().then(() => {
      btnSettingLoading.value = false;
      getInfo();
      settingVisible.value = false;
    });
  });
};
const minEthForm = reactive({
  minEth: null
});
const btnLoading = ref(false);
const minEthRules = reactive({
  minEth: [
    { required: true, message: "请输入", trigger: "blur" },
    // 为数字
    {
      //正则
      pattern: /^-?\d+(,\d{3})*(\.\d{1,2})?$/,
      message: "请输入数字",
      trigger: "blur"
    }
  ]
});
const handleIDOStatus = () => {
  if (privateInfo.value.IDOStatus) {
    ElMessageBox.confirm("此操作将关闭IDO, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(async () => {
        const res = await contract.pauseIDO();
        btnLoading.value = true;
        res.wait().then(() => {
          btnLoading.value = false;
          getInfo();
        });
      })
      .catch(() => {});
  } else {
    ElMessageBox.confirm("此操作将开启IDO, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(async () => {
      // 开启
      const res = await contract.activateIDO();
      res.wait().then(() => {
        getInfo();
      });
    });
  }
};

const handleMinEth = () => {
  title.value = "最小的eth";

  minEthDialogVisible.value = true;
  btnLoading.value = false;
  minEthFormRef.value?.resetFields();
};

const handleMaxEth = () => {
  title.value = "最大的eth";
  minEthDialogVisible.value = true;
  btnLoading.value = false;
  minEthFormRef.value?.resetFields();
};

const handleExchangeRate = () => {
  title.value = "1ETH换多少token";
  minEthDialogVisible.value = true;
  btnLoading.value = false;
  minEthFormRef.value?.resetFields();
};

const handleIsClaim = async () => {
  if (privateInfo.value.isClaim) {
    ElMessageBox.confirm("此操作将关闭认领, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(async () => {
        const res = await contract.pauseTokenClaim();
        btnLoading.value = true;
        res.wait().then(() => {
          btnLoading.value = false;
          getInfo();
        });
      })
      .catch(() => {});
  } else {
    ElMessageBox.confirm("此操作将开启认领, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(async () => {
      // 开启
      const res = await contract.activateTokenClaim();
      res.wait().then(() => {
        getInfo();
      });
    });
  }
};

// 确定
const handleMinEthSubmit = async () => {
  minEthFormRef.value.validate(async valid => {
    if (!valid) return;
    btnLoading.value = true;
    const toWei = value => {
      return ethers.utils.parseEther(value);
    };
    // const toEth = value => {
    //   return ethers.utils.formatEther(value);
    // };
    if (title.value === "最小的eth") {
      console.log("最小的eth");
      console.log(toWei(minEthForm.minEth));

      const res = await contract.setMinEthPerExchange(toWei(minEthForm.minEth));
      btnLoading.value = true;
      res.wait().then(() => {
        btnLoading.value = false;
        getInfo();
        minEthDialogVisible.value = false;
      });
    } else if (title.value === "最大的eth") {
      console.log("最大的eth");
      console.log(toWei(minEthForm.minEth));
      const res = await contract.setMaxEthPerExchange(toWei(minEthForm.minEth));
      btnLoading.value = true;
      res.wait().then(() => {
        btnLoading.value = false;
        getInfo();
        minEthDialogVisible.value = false;
      });
    } else if (title.value === "1ETH换多少token") {
      console.log("1ETH换多少token");
      console.log(toWei(minEthForm.minEth));
      const res = await contract.setExchangeRate(minEthForm.minEth);
      btnLoading.value = true;
      res.wait().then(() => {
        btnLoading.value = false;
        getInfo();
        minEthDialogVisible.value = false;
      });
    }
  });
};

let contract = reactive({});
// 使用ethers链接钱包
const connectEthers = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  // 获取accounts
  privateInfo.value.accounts = await signer.getAddress();
  contract = new ethers.Contract("0x1f4D5e62069AB051D7640fAe020D623f46AD97a7", abi, signer);
  console.log("contract", contract);
  await getInfo();
};
// 转化为eth
const getInfo = async () => {
  const toEth = value => {
    return ethers.utils.formatEther(value);
  };
  // 获取最小的eth
  contract.minEthPerExchange().then(res => {
    // 转化为eth
    console.log("minEthPerExchange", toEth(res));
    privateInfo.value.minETH = toEth(res);
  });
  // 获取最大的eth
  contract.maxEthPerExchange().then(res => {
    console.log("maxEthPerExchange", toEth(res));
    privateInfo.value.maxETH = toEth(res);
  });

  // exchangeRate
  contract.exchangeRate().then(res => {
    console.log("exchangeRate", res);
    // 转化为eth
    // console.log('exchangeRate', toEth(res))
    privateInfo.value.exchangeRate = res;
  });
  // 是否开启认领
  contract.isTokenClaimActive().then(res => {
    console.log("isClaim", res);
    privateInfo.value.isClaim = res;
  });
  contract.isIDOActive().then(res => {
    console.log("isClaim", res);
    privateInfo.value.IDOStatus = res;
  });
  contract.getNumbers().then(res => {
    console.log("getNumbers", res);
    privateInfo.value.baseSetting = res;
  });
};
onMounted(() => {
  connectEthers();
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
